import { tool } from "@openai/agents";
import { z } from "zod";
import { getCalendarService } from "../../lib/googleapis";
import { getDayBoundsInUTC, formatEvent } from "../../lib/misc";
import { calendar_v3 } from "googleapis";
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
    const service = await getCalendarService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    const res = await service.calendars.insert({
      requestBody: { summary: args.calendarName },
    });

    return res.data;
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
    const service = await getCalendarService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    const res = await service.calendarList.list({
      maxResults: Math.min(200, args.maxCapacity),
    });
    return (
      res.data.items?.map((c) => ({
        id: c.id!,
        name: c.summary!,
        description: c.description ?? "",
      })) || []
    );
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
    const service = await getCalendarService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    const res = await service.events.list({
      calendarId: args.calendarId,
      maxResults: args.maxCapacity,
      singleEvents: true,
      orderBy: "startTime",
    });
    return res.data.items?.map(formatEvent) || [];
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
    const service = await getCalendarService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    const date = new Date(args.date);
    const { timeMin, timeMax } = getDayBoundsInUTC(date, "Africa/Lagos");

    const res = await service.events.list({
      calendarId: args.calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });
    return res.data.items?.map(formatEvent) || [];
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
    const service = await getCalendarService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    const { timeMin } = getDayBoundsInUTC(
      new Date(args.startDate),
      "Africa/Lagos"
    );

    const { timeMax } = getDayBoundsInUTC(
      new Date(args.endDate),
      "Africa/Lagos"
    );

    const res = await service.events.list({
      calendarId: args.calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });
    return res.data.items?.map(formatEvent) || [];
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
    const service = await getCalendarService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    const { timeMin } = getDayBoundsInUTC(new Date(), "Africa/Lagos");

    const res = await service.events.list({
      calendarId: args.calendarId,
      timeMin,
      maxResults: args.maxCapacity,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = res.data.items ?? [];
    const now = new Date();

    const ongoing = events.filter((e) => {
      const start = new Date(e.start?.dateTime || e.start?.date || "");
      const end = new Date(e.end?.dateTime || e.end?.date || "");
      return start <= now && now <= end;
    });
    return ongoing.map(formatEvent);
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
    const service = await getCalendarService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    const { timeMin, timeMax } = getDayBoundsInUTC(new Date(), "Africa/Lagos");

    const res = await service.events.list({
      calendarId: args.calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });
    return res.data.items?.map(formatEvent) || [];
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
    const service = await getCalendarService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    const event: calendar_v3.Schema$Event = {
      summary: args.summary,
      description: args.description || undefined,
      start: {
        dateTime: args.startTime,
        timeZone: "Africa/Lagos",
      },
      end: {
        dateTime: args.endTime,
        timeZone: "Africa/Lagos",
      },
      attendees: args.attendees?.map((email) => ({ email })) || undefined,
    };

    const res = await service.events.insert({
      calendarId: args.calendarId,
      requestBody: event,
    });

    return res.data;
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
    const service = await getCalendarService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    const event: calendar_v3.Schema$Event = {};
    if (args.summary) event.summary = args.summary;
    if (args.description) event.description = args.description;
    if (args.startTime) {
      event.start = {
        dateTime: args.startTime,
        timeZone: "Africa/Lagos",
      };
    }
    if (args.endTime) {
      event.end = {
        dateTime: args.endTime,
        timeZone: "Africa/Lagos",
      };
    }

    const res = await service.events.update({
      calendarId: args.calendarId,
      eventId: args.eventId,
      requestBody: event,
    });

    return res.data;
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
    const service = await getCalendarService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    await service.events.delete({
      calendarId: args.calendarId,
      eventId: args.eventId,
    });

    return { success: true };
  },
});
