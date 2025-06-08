import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ThreadModel, ChatMessageModel } from "../models/Chat";
import { z } from "zod";

/**
 * POST /chat/message
 * Body: { message: string }
 * Auth: Required
 */
const chatSchema = z.object({
  message: z.string(),
  threadId: z.string().optional(),
  userId: z.string().optional(),
  role: z.enum(["user", "agent"]).optional(),
});

export async function createMessage(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const result = chatSchema.safeParse(req.body);

    if (!result.success) {
      res
        .status(400)
        .json({ message: "Invalid input", errors: result.error.flatten() });
    } else {
      const {
        message,
        threadId,
        userId = req.user._id,
        role = "user",
      } = result.data;

      const thread_id =
        threadId ?? (await ThreadModel.create({ userId }))._id.toString();

      await ChatMessageModel.create({
        threadId: thread_id,
        userId,
        role,
        content: message,
      });

      res.status(200).json({
        message: "Message sent successfully",
        data: {
          threadId: thread_id,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
