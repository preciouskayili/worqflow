import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth";
import { ThreadModel } from "../models/Chat";
import { saveChatHistory } from "../lib/vectorestore";

const taskSchema = z.object({
  task: z.string().min(1),
  threadId: z.string().optional(),
});

export async function createTask(req: AuthRequest, res: Response) {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Task is required" });
    return;
  }

  const { task, threadId } = parsed.data;

  try {
    // Find existing thread or create a new one
    let thread = threadId ? await ThreadModel.findById(threadId) : null;

    if (!thread) {
      thread = await ThreadModel.create({
        userId: req.user._id,
        title: "New Thread",
      });
    }

    const message = await saveChatHistory(
      task,
      req.user._id.toString(),
      thread._id.toString(),
      "user"
    );

    res.status(201).json({
      message: "Task recorded",
      data: { threadId: thread._id, messageId: message._id },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
