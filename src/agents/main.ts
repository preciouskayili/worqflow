import { Agent } from "@openai/agents";
import { MAIN_AGENT_PROMPT } from "../lib/prompts";
import { MODEL } from "../config/env";
import { calendarAgent } from "./calendar";
import { memoryAgent } from "./memory";
import { gmailAgent } from "./mail";
import { githubAgent } from "./github";

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
    gmailAgent.asTool({
      toolName: "transfer_to_gmail_agent",
      toolDescription: "Handle the user's email requests",
    }),
    githubAgent.asTool({
      toolName: "transfer_to_github_agent",
      toolDescription:
        "Handle the user's GitHub repository and project requests",
    }),
  ],
});
