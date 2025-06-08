import { Agent } from "@openai/agents";
import {
  listCalendarList,
  listCalendarEvents,
  insertCalendarEvent,
  createCalendarList,
} from "../tools/googleCalendarTools";
import { CALENDAR_AGENT_PROMPT } from "../utils/prompts";
import { MODEL } from "../config/env";

export const calendarAgent = new Agent({
  name: "calendar_agent",
  instructions: CALENDAR_AGENT_PROMPT,
  model: MODEL,
  tools: [
    listCalendarList,
    listCalendarEvents,
    insertCalendarEvent,
    createCalendarList,
  ],
});
