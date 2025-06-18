import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { getIntegration } from "../../lib/googleapis";
import { mainAgent } from "../../agents/main";
import { run } from "@openai/agents";
import { ChatMessageModel, ThreadModel } from "../../models/Chat";
import { z } from "zod";
import { getRelevantMessages } from "../../lib/vectorestore";

const paramsSchema = z.object({
  threadId: z.string(),
  messageId: z.string(),
});

export async function messageEvents(req: AuthRequest, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

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

  const integration = await getIntegration(req.user._id);
  if (!integration) {
    res.write(
      `event: error\ndata: ${JSON.stringify({
        message: "Integration not found",
      })}\n\n`
    );
    res.end();
    return;
  }

  const context = await getRelevantMessages(
    userMsg.content,
    req.user._id.toString(),
    threadId,
    10
  );

  const history = context.map((m) => m.content).join("\n\n");

  try {
    const result = await run(mainAgent, userMsg.content, {
      context: {
        userId: req.user._id,
        access_token: integration.access_token!,
        refresh_token: integration.refresh_token!,
      },
      stream: true,
    });

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

    res.end();
  } catch (err: any) {
    console.error(err);
    res.write(
      `event: error\ndata: ${JSON.stringify({
        message: "Agent error",
        error: err.message,
      })}\n\n`
    );
    res.end();
  }

  req.on("close", () => {
    console.log("Client disconnected from SSE");
  });
}
