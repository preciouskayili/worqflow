import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { mainAgent } from "../../agents/main";
import { run } from "@openai/agents";
import { ChatMessageModel, ThreadModel } from "../../models/Chat";
import { z } from "zod";
import { getRelevantMessages, saveChatHistory } from "../../lib/vectorestore";
import { setupSSE, heartbeatStream } from "../../lib/misc";
import { IntegrationModel } from "../../models/Integrations";

const paramsSchema = z.object({
  threadId: z.string(),
  messageId: z.string(),
});

export async function messageEvents(req: AuthRequest, res: Response) {
  setupSSE(res);
  res.write(
    'event: connected\ndata: {"message": "Connection established"}\n\n'
  );

  const { success, data } = paramsSchema.safeParse(req.params);
  if (!success) {
    res.write(
      `event: error\ndata: ${JSON.stringify({ message: "Invalid params" })}\n\n`
    );
    res.end();
    return;
  }

  const { threadId, messageId } = data;

  const thread = await ThreadModel.findById(threadId);
  if (!thread) {
    res.write(
      `event: error\ndata: ${JSON.stringify({
        message: "Thread not found",
      })}\n\n`
    );
    res.end();
    return;
  }

  const userMsg = await ChatMessageModel.findOne({
    _id: messageId,
    user: req.user._id,
    thread: threadId,
  });

  if (!userMsg) {
    res.write(
      `event: error\ndata: ${JSON.stringify({
        message: "User message not found",
      })}\n\n`
    );
    res.end();
    return;
  }

  const integrations = await IntegrationModel.find({
    user_id: req.user._id,
  }).lean();

  if (!integrations) {
    res.write(
      `event: error\ndata: ${JSON.stringify({
        message: "Integration not found",
      })}\n\n`
    );
    res.end();
    return;
  }

  const integrationsMap = {};

  integrations.forEach((integration) => {
    integrationsMap[integration.name] = integration;
  });

  const contextMessages = await getRelevantMessages(
    userMsg.content,
    req.user._id.toString(),
    threadId,
    10
  );

  const historyText = contextMessages.length
    ? `<history>${contextMessages.map((m) => m.content).join("\n\n")}</history>`
    : "";

  const runContext = {
    userId: req.user._id,
    userEmail: req.user.email,
    userName: req.user.name,
    integrations: integrationsMap,
  };

  const timeout = setTimeout(() => {
    res.write(`event: error\ndata: {"message": "Agent timeout"}\n\n`);
    res.end();
  }, 60000);

  const heartbeat = heartbeatStream(res);

  try {
    const result = await run(
      mainAgent,
      `User: \n${req.user.name ?? "[Not Provided]"}\n${
        req.user.email
      }\n\nMessage: ${userMsg.content}\n\n${historyText}`,
      { context: runContext, stream: true }
    );

    for await (const event of result) {
      if (event.type === "raw_model_stream_event") {
        res.write(`event: message\ndata: ${JSON.stringify(event.data)}\n\n`);
      }
      if (event.type === "agent_updated_stream_event") {
        res.write(
          `event: message\ndata: {"type": "${event.type}", "agent": "${event.agent.name}"}\n\n`
        );
      }
      if (event.type === "run_item_stream_event") {
        res.write(
          `event: message\ndata: {"type": "${
            event.type
          }", "item": ${JSON.stringify(event.item)}}\n\n`
        );
      }
    }

    if (result.finalOutput) {
      await saveChatHistory(
        result.finalOutput,
        req.user._id.toString(),
        threadId,
        "agent"
      );
    }

    clearTimeout(timeout);
    clearInterval(heartbeat);
    res.end();
  } catch (err: any) {
    console.error(err);
    clearTimeout(timeout);
    clearInterval(heartbeat);
    res.write(
      `event: error\ndata: ${JSON.stringify({
        message: "Agent error",
        error: err.message,
      })}\n\n`
    );
    res.end();
  }

  req.on("close", () => {
    clearTimeout(timeout);
    clearInterval(heartbeat);
    console.log("Client disconnected from SSE");
  });
}
