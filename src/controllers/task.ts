import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth";
import { ChatMessageModel, ThreadModel } from "../models/Chat";

const taskSchema = z.object({
  task: z.string(),
  threadId: z.string().optional(),
});

export async function createTask(req: AuthRequest, res: Response) {
  try {
    const result = taskSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Task is required" });
    } else {
      const { task, threadId } = result.data;

      if (threadId) {
        let thread = await ThreadModel.findById(threadId);

        if (!thread) {
          thread = await ThreadModel.create({
            user_id: req.user._id,
            title: "New Thread",
          });
        }

        const taskDoc = await ChatMessageModel.create({
          user_id: req.user._id,
          thread: thread._id,
          task: task,
          status: "pending",
        });

        res.status(200).json({ message: "Task created", task: taskDoc });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
