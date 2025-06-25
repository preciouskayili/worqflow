import { Agent } from "@openai/agents";
import * as calendarTools from "../tools/google/calendar";
import { CALENDAR_AGENT_PROMPT } from "../lib/prompts";

const {
  listCalendarList,
  listCalendarEvents,
  insertCalendarEvent,
  createCalendarList,
  deleteCalendarEvent,
  listCurrentCalendarEvents,
  listTodaysEvents,
  listEventsInRange,
} = calendarTools;

export const calendarAgent = new Agent({
  name: "calendar_agent",
  instructions: CALENDAR_AGENT_PROMPT,
  tools: [
    listCalendarList,
    listCalendarEvents,
    insertCalendarEvent,
    createCalendarList,
    deleteCalendarEvent,
    listCurrentCalendarEvents,
    listTodaysEvents,
    listEventsInRange,
  ],
});
