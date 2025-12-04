import { tool } from "@openai/agents";
import { z } from "zod";
import { RunContext } from "@openai/agents";
import * as memoryAdapters from "../services/adapters/memory";

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
    return memoryAdapters.createMemory(
      args.text,
      runContext?.context?.userId!
    );
  },
});
