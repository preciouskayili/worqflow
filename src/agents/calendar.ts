import { Agent } from "@openai/agents";
import * as calendarTools from "../tools/googleCalendarTools";
import { CALENDAR_AGENT_PROMPT } from "../lib/prompts";

export const calendarAgent = new Agent({
  name: "calendar_agent",
  instructions: CALENDAR_AGENT_PROMPT,
  tools: [...Object.values(calendarTools)],
});
