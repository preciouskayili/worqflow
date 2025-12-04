import { getCalendarService } from "../../lib/googleapis";
import { getDayBoundsInUTC, formatEvent } from "../../lib/misc";
import { calendar_v3 } from "googleapis";

export const createCalendarList = async (
  args: { calendarName: string; attendees?: string[] | null },
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const service = await getCalendarService(googleIntegration);

  const res = await service.calendars.insert({
    requestBody: { summary: args.calendarName },
  });

  return res.data;
};

export const listCalendarList = async (
  args: { maxCapacity: number; userId: string },
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const service = await getCalendarService(googleIntegration);

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
};

export const listCalendarEvents = async (
  args: { calendarId: string; maxCapacity: number; userId: string },
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const service = await getCalendarService(googleIntegration);

  const res = await service.events.list({
    calendarId: args.calendarId,
    maxResults: args.maxCapacity,
    singleEvents: true,
    orderBy: "startTime",
  });
  return res.data.items?.map(formatEvent) || [];
};

export const listEventsForDate = async (
  args: { calendarId: string; userId: string; date: string },
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const service = await getCalendarService(googleIntegration);

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
};

export const listEventsInRange = async (
  args: {
    calendarId: string;
    userId: string;
    startDate: string;
    endDate: string;
  },
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const service = await getCalendarService(googleIntegration);

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
};

export const listCurrentCalendarEvents = async (
  args: { calendarId: string; maxCapacity: number; userId: string },
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const service = await getCalendarService(googleIntegration);

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
};

export const listTodaysEvents = async (
  args: { calendarId: string; userId: string },
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const service = await getCalendarService(googleIntegration);

  const { timeMin, timeMax } = getDayBoundsInUTC(new Date(), "Africa/Lagos");

  const res = await service.events.list({
    calendarId: args.calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
  });
  return res.data.items?.map(formatEvent) || [];
};

export const insertCalendarEvent = async (
  args: {
    calendarId: string;
    summary: string;
    startTime: string;
    endTime: string;
    description?: string | null;
    attendees?: string[] | null;
  },
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const service = await getCalendarService(googleIntegration);

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
    attendees:
      args.attendees?.map((email: string) => ({ email })) || undefined,
  };

  const res = await service.events.insert({
    calendarId: args.calendarId,
    requestBody: event,
  });

  return res.data;
};

export const updateCalendarEvent = async (
  args: {
    calendarId: string;
    eventId: string;
    summary?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    description?: string | null;
  },
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const service = await getCalendarService(googleIntegration);

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
};

export const deleteCalendarEvent = async (
  args: { calendarId: string; eventId: string },
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const service = await getCalendarService(googleIntegration);

  await service.events.delete({
    calendarId: args.calendarId,
    eventId: args.eventId,
  });

  return { success: true };
};

