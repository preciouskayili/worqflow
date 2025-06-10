import { Agent } from "@openai/agents";
import { MAIN_AGENT_PROMPT } from "../utils/prompts";
import { MODEL } from "../config/env";
import { calendarAgent } from "./calendar";
import { memoryAgent } from "./memory";

export const mainAgent = new Agent({
  name: "main_agent",
  instructions: MAIN_AGENT_PROMPT,
  model: MODEL,
  tools: [
    calendarAgent.asTool({
      toolName: "transfer_to_calendar_agent",
      toolDescription: "Handle the user's calendar requests",
    }),
    memoryAgent.asTool({
      toolName: "transfer_to_memory_agent",
      toolDescription: "Handle the user's memory requests",
    }),
  ],
});
