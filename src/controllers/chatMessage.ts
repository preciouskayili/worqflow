import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ChatHistoryModel } from "../models/ChatHistory";
import axios from "axios";

const AI_AGENT_URL = process.env.AI_AGENT_URL || "http://localhost:8000/";

/**
 * POST /chat/message
 * Body: { message: string }
 * Auth: Required
 */
export async function handleChatMessage(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.user?._id || req.body.userId;
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    await ChatHistoryModel.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          messages: { role: "user", content: message, timestamp: new Date() },
        },
      },
      { new: true, upsert: true }
    );

    const chatHistory = await ChatHistoryModel.findOne({ user: userId });
    const contextMessages = chatHistory?.messages?.slice(-10) || [];

    const aiResponse = await axios.post(
      `${AI_AGENT_URL}/task`,
      { messages: contextMessages },
      { headers: { Authorization: req.headers.authorization || "" } }
    );
    const aiMessage = aiResponse.data?.message || "(No response)";

    await ChatHistoryModel.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          messages: { role: "ai", content: aiMessage, timestamp: new Date() },
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      messages: [
        { role: "user", content: message },
        { role: "ai", content: aiMessage },
      ],
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}
