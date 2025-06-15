import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { getIntegration } from "../../lib/googleapis";
import { mainAgent } from "../../agents/main";
import { run } from "@openai/agents";
import { ChatMessageModel, ThreadModel } from "../../models/Chat";

export async function messageEvents(req: AuthRequest, res: Response) {
  // Headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send initial connection established message
  res.write(
    'event: connected\ndata: {"message": "Connection established"}\n\n'
  );
  if (!req.params.threadId) {
    res.status(400).json({ message: "Thread ID is required" });
  } else {
    const thread = await ThreadModel.findById(req.params.threadId);
    if (!thread) {
      res.status(404).json({ message: "Thread not found" });
    } else {
      const integration = await getIntegration(req.user._id);

      if (!integration) {
        res.status(404).json({ message: "Integration not found" });
      } else {
        const task = await ChatMessageModel.findOne({
          thread: req.params.threadId,
          user: req.user._id,
        })
          .sort({ createdAt: -1 })
          .limit(1);

        if (!task) {
          res.status(404).json({ message: "Task failed to create" });
        } else {
          const result = await run(mainAgent, task.content, {
            context: {
              userId: req.user._id,
              access_token: integration.access_token!,
              refresh_token: integration.refresh_token!,
            },
            stream: true,
          });

          for await (const event of result) {
            // these are the raw events from the model
            if (event.type === "raw_model_stream_event") {
              res.write(
                `event: message\ndata: ${JSON.stringify(event.data)}\n\n`
              );
            }
            // agent updated events
            if (event.type == "agent_updated_stream_event") {
              res.write(
                `event: message\ndata: {"type": "${event.type}", "agent": "${event.agent.name}"}`
              );
            }
            // Agent SDK specific events
            if (event.type === "run_item_stream_event") {
              res.write(
                `event: message\ndata: {"type": "${event.type}", "item": ${event.item}}`
              );
            }
          }

          res.end();
        }
      }
    }
  }
}
