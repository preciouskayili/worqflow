import { Agent } from "@openai/agents";
import { MEMORY_AGENT_PROMPT } from "../lib/prompts";
import { fetchMemories, createMemory } from "../tools/memoryTools";

export const memoryAgent = new Agent({
  name: "memory_agent",
  instructions: MEMORY_AGENT_PROMPT,
  tools: [fetchMemories, createMemory],
});
