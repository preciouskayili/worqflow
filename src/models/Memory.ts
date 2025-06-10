import mongoose, { Document, Schema } from "mongoose";

export enum MemoryType {
  EPISODIC = "episodic",
  FACTUAL = "factual",
  SEMANTIC = "semantic",
}

export interface Memory extends Document {
  type: MemoryType;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MemorySchema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(MemoryType),
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const MemoryModel = mongoose.model<Memory>("Memory", MemorySchema);
