import { Agent } from "@openai/agents";
import { MEMORY_AGENT_PROMPT } from "../utils/prompts";
import { MODEL } from "../config/env";
import { fetchMemories, createMemory } from "../tools/memoryTools";

export const memoryAgent = new Agent({
  name: "memory_agent",
  instructions: MEMORY_AGENT_PROMPT,
  model: MODEL,
  tools: [fetchMemories, createMemory],
});
