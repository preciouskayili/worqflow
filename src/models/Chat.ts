import { Schema, model, Types } from "mongoose";

const ChatSessionSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, ref: "User" },
  sessionId: { type: String, required: true, unique: true },
  title: { type: String },
  startedAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now },
});

const ChatMessageSchema = new Schema({
  sessionId: { type: String, required: true },
  userId: { type: Types.ObjectId, required: true, ref: "User" },
  role: { type: String, enum: ["user", "agent"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ChatSession = model("ChatSession", ChatSessionSchema);
export const ChatMessage = model("ChatMessage", ChatMessageSchema);
