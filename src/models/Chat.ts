import { Schema, model, Types } from "mongoose";

const ThreadSchema = new Schema(
  {
    lastMessageAt: { type: Date, default: Date.now, required: true },
    userId: { type: Types.ObjectId, required: true, ref: "User" },
    title: { type: String, default: "[No Name]" },
  },
  { timestamps: true }
);

const ChatMessageSchema = new Schema(
  {
    thread: { type: Types.ObjectId, required: true, ref: "Thread" },
    user: { type: Types.ObjectId, required: true, ref: "User" },
    role: { type: String, enum: ["user", "agent"], required: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const ThreadModel = model("Thread", ThreadSchema);
export const ChatMessageModel = model("ChatMessage", ChatMessageSchema);
