import { tool } from "@openai/agents";
import { z } from "zod";
import * as calendarAdapters from "../../services/adapters/calendar";
import { RunContext } from "@openai/agents";
import { TIntegrations } from "../../../types/integrations";

export const createCalendarList = tool({
  name: "create_calendar_list",
  description: "Creates a new calendar",
  parameters: z.object({
    calendarName: z.string(),
    attendees: z.array(z.string()).nullable().default(null),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return calendarAdapters.createCalendarList(args, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const listCalendarList = tool({
  name: "list_calendar_list",
  description: "Lists all the calendars available",
  parameters: z.object({
    maxCapacity: z.number().int().positive(),
    userId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return calendarAdapters.listCalendarList(args, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const listCalendarEvents = tool({
  name: "list_calendar_events",
  description: "Lists all the events in a calendar",
  parameters: z.object({
    calendarId: z.string(),
    maxCapacity: z.number().int().positive(),
    userId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return calendarAdapters.listCalendarEvents(args, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const listEventsForDate = tool({
  name: "list_events_for_date",
  description: "Lists all events for a specific date in the given calendar",
  parameters: z.object({
    calendarId: z.string(),
    userId: z.string(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected format: YYYY-MM-DD"),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return calendarAdapters.listEventsForDate(args, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const listEventsInRange = tool({
  name: "list_events_in_range",
  description:
    "Lists all events within a specific date range in the given calendar",
  parameters: z.object({
    calendarId: z.string(),
    userId: z.string(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected format: YYYY-MM-DD"),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected format: YYYY-MM-DD"),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return calendarAdapters.listEventsInRange(args, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const listCurrentCalendarEvents = tool({
  name: "list_current_calendar_events",
  description:
    "Lists events that are happening right now in the current calendar",
  parameters: z.object({
    calendarId: z.string(),
    maxCapacity: z.number().int().positive(),
    userId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return calendarAdapters.listCurrentCalendarEvents(args, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const listTodaysEvents = tool({
  name: "list_todays_events",
  description: "Lists all events happening today in the given calendar",
  parameters: z.object({
    calendarId: z.string(),
    userId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return calendarAdapters.listTodaysEvents(args, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const insertCalendarEvent = tool({
  name: "insert_calendar_event",
  description: "Inserts an event into a calendar",
  parameters: z.object({
    calendarId: z.string(),
    summary: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    description: z.string().nullable().default(null),
    attendees: z.array(z.string()).nullable().default(null),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return calendarAdapters.insertCalendarEvent(args, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const updateCalendarEvent = tool({
  name: "update_calendar_event",
  description: "Updates an existing calendar event",
  parameters: z.object({
    calendarId: z.string(),
    eventId: z.string(),
    summary: z.string().nullable().default(null),
    startTime: z.string().nullable().default(null),
    endTime: z.string().nullable().default(null),
    description: z.string().nullable().default(null),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return calendarAdapters.updateCalendarEvent(args, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const deleteCalendarEvent = tool({
  name: "delete_calendar_event",
  description: "Deletes a calendar event",
  parameters: z.object({
    calendarId: z.string(),
    eventId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return calendarAdapters.deleteCalendarEvent(args, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});
