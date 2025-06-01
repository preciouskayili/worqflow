import { Response } from "express";
import { ChatHistoryModel } from "../models/ChatHistory";
import { UserModel } from "../models/User";
import { AuthRequest } from "../middleware/auth";

// POST /chat/history
export async function storeChatHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id || req.body.userId; // assumes req.user is populated by auth middleware
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ message: "Messages array is required" });
      return;
    }
    // Upsert chat history for the user
    const chatHistory = await ChatHistoryModel.findOneAndUpdate(
      { user: userId },
      { $push: { messages: { $each: messages } } },
      { new: true, upsert: true }
    );
    res.status(200).json({ message: "Chat history saved", chatHistory });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}
