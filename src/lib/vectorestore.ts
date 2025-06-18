import { env } from "../config/env";
import { Pinecone } from "@pinecone-database/pinecone";
import openai from "./openai";
import { v4 as uuidv4 } from "uuid";
import { ChatMessageModel } from "../models/Chat";
import { ObjectId } from "mongoose";
export const pc = new Pinecone({ apiKey: env.PINECONE_API_KEY });
const INDEX_NAME = env.PINECONE_INDEX_NAME;
const EMDBEDDING_DIMENSION = 1536;

export async function createStore() {
  const indexList = await pc.listIndexes();

  if (!indexList.indexes?.some((index) => index.name === INDEX_NAME)) {
    await pc.createIndex({
      name: INDEX_NAME,
      dimension: EMDBEDDING_DIMENSION,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });
  }
}

export async function getEmbedding(text: string) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });

  return embedding.data[0].embedding;
}

export async function saveMemory(text: string, userId: string) {
  await createStore();

  const index = pc.index(INDEX_NAME);

  const embedding = await getEmbedding(text);

  const result = await index.upsert([
    {
      id: uuidv4(),
      values: embedding,
      metadata: {
        user_id: userId,
        timestamp: new Date().toISOString(),
        content: text,
      },
    },
  ]);

  return result;
}

export async function saveChatHistory(
  query: string,
  userId: string,
  threadId: string,
  role: "user" | "agent"
) {
  const msg = await ChatMessageModel.create({
    content: query,
    role,
    user: userId,
    thread: threadId,
  });

  const embedding = await getEmbedding(query);

  await pc.index(INDEX_NAME).upsert([
    {
      id: uuidv4(),
      values: embedding,
      metadata: {
        user_id: userId,
        timestamp: new Date().toISOString(),
        role,
      },
    },
  ]);

  return msg;
}

export async function getRelevantMessages(
  query: string,
  userId: string,
  threadId: string,
  limit = 10
) {
  const qEmb = await getEmbedding(query);

  const result = await pc.index(INDEX_NAME).query({
    vector: qEmb,
    topK: limit,
    includeMetadata: true,
    filter: {
      user_id: userId,
      thread: threadId,
    },
  });

  const ids = result.matches?.map((match) => match.id);

  const messages = await ChatMessageModel.find({
    _id: { $in: ids },
  });

  return messages;
}

export async function fetchMemory(text: string, userId: string, limit: number) {
  const index = pc.index(INDEX_NAME);

  const query = await index.query({
    vector: await getEmbedding(text),
    topK: limit,
    filter: {
      user_id: userId,
    },
    includeMetadata: true,
  });

  return query.matches;
}
