import {
  Agent,
  OpenAIProvider,
  setDefaultOpenAIClient,
  setOpenAIAPI,
  setDefaultModelProvider,
  setTracingDisabled,
} from "@openai/agents";
import { MAIN_AGENT_PROMPT } from "../lib/prompts";
import { env, MODEL } from "../config/env";
import { calendarAgent } from "./google/calendar";
import { memoryAgent } from "./memory";
import { gmailAgent } from "./google/mail";
import { githubAgent } from "./github";
import { docsAgent } from "./google/docs";
import { slackAgent } from "./slack";
import { linearAgent } from "./linear";
import { figmaAgent } from "./figma";
import OpenAI from "openai";

const openaiClient = new OpenAI({
  apiKey: "free",
  baseURL: "https://api.algion.dev/v1",
});

const modelProvider = new OpenAIProvider({
  openAIClient: openaiClient,
});

setOpenAIAPI("chat_completions");
setDefaultModelProvider(modelProvider);
setDefaultOpenAIClient(openaiClient);
setTracingDisabled(true);

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
    docsAgent.asTool({
      toolName: "transfer_to_docs_agent",
      toolDescription: "Handle the user's Google Docs requests",
    }),
    githubAgent.asTool({
      toolName: "transfer_to_github_agent",
      toolDescription:
        "Handle the user's GitHub repository and project requests",
    }),
    slackAgent.asTool({
      toolName: "transfer_to_slack_agent",
      toolDescription: "Handle the user's Slack requests",
    }),
    linearAgent.asTool({
      toolName: "transfer_to_linear_agent",
      toolDescription: "Handle the user's Linear requests",
    }),
    figmaAgent.asTool({
      toolName: "transfer_to_figma_agent",
      toolDescription: "Handle the user's Figma requests",
    }),
  ],
});
