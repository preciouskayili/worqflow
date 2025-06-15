import { tool } from "@openai/agents";
import { z } from "zod";
import { getCalendarService } from "../lib/googleapis";
import { getDayBoundsInUTC, formatEvent } from "../lib/misc";
import { calendar_v3 } from "googleapis";
import { RunContext } from "@openai/agents";

type UserInfo = {
  access_token: string;
  refresh_token: string;
  expires_at?: string;
};

export const createCalendarList = tool({
  name: "create_calendar_list",
  description: "Creates a new calendar",
  parameters: z.object({
    calendarName: z.string(),
    attendees: z.array(z.string()).nullable().default(null),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getCalendarService(runContext?.context!);
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
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getCalendarService(runContext?.context!);
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
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getCalendarService(runContext?.context!);
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
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getCalendarService(runContext?.context!);
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
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getCalendarService(runContext?.context!);
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
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getCalendarService(runContext?.context!);
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
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getCalendarService(runContext?.context!);
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
    description: z.string(),
    location: z.string(),
    attendees: z.array(z.string()).nullable().default(null),
    timezone: z.string(),
    createGoogleMeet: z.boolean(),
    userId: z.string(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getCalendarService(runContext?.context!);

    const eventBody: calendar_v3.Schema$Event = {
      summary: args.summary,
      location: args.location,
      description: args.description,
      start: { dateTime: args.startTime, timeZone: args.timezone },
      end: { dateTime: args.endTime, timeZone: args.timezone },
      attendees: args.attendees?.map((email) => ({ email })),
      conferenceData: args.createGoogleMeet
        ? {
            createRequest: {
              requestId: `meet_${Date.now()}`,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          }
        : undefined,
    };

    const res = await service.events.insert({
      calendarId: args.calendarId,
      requestBody: eventBody,
      conferenceDataVersion: args.createGoogleMeet ? 1 : undefined,
    });
    return formatEvent(res.data);
  },
});

export const deleteCalendarEvent = tool({
  name: "delete_calendar_event",
  description: "Deletes an event from a calendar",
  parameters: z.object({
    calendarId: z.string(),
    eventId: z.string(),
    userId: z.string(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getCalendarService(runContext?.context!);

    const res = await service.events.delete({
      calendarId: args.calendarId,
      eventId: args.eventId,
    });
    return res.data;
  },
});

export const updateCalendarEvent = tool({
  name: "update_calendar_event",
  description: "Updates an event in a calendar",
  parameters: z.object({
    calendarId: z.string(),
    eventId: z.string(),
    userId: z.string(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getCalendarService(runContext?.context!);
    const res = await service.events.update({
      calendarId: args.calendarId,
      eventId: args.eventId,
      requestBody: args.event,
    });
    return res.data;
  },
});
