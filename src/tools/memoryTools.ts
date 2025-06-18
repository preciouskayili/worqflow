import { getEmbedding, saveMemory } from "../lib/vectorestore";
import { pc } from "../lib/vectorestore";
import { env } from "../config/env";
import { tool } from "@openai/agents";
import { z } from "zod";
import { RunContext } from "@openai/agents";

const INDEX_NAME = env.INDEX_NAME;

export const fetchMemories = tool({
  name: "fetch_memories",
  description: "Fetches memories for a user",
  parameters: z.object({
    text: z.string(),
    limit: z.number().int().positive().optional().default(5),
  }),
  async execute(
    args: { text: string; limit: number },
    runContext?: RunContext<{ userId: string }>
  ) {
    const index = pc.index(INDEX_NAME);

    const embedding = await getEmbedding(args.text);

    const query = await index.query({
      vector: embedding,
      topK: args.limit,
      filter: { user_id: { $eq: runContext?.context?.userId } },
      includeMetadata: true,
    });

    return query.matches;
  },
});

export const createMemory = tool({
  name: "create_memory",
  description: "Creates a memory for a user",
  parameters: z.object({
    text: z.string(),
  }),
  async execute(
    args: { text: string },
    runContext?: RunContext<{ userId: string }>
  ) {
    await saveMemory(args.text, runContext?.context?.userId!);
    return "Memory created";
  },
});
