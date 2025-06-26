import { calendar_v3 } from "googleapis";
import { IntegrationModel } from "../models/Integrations";
import { Response } from "express";
import { LinearClient } from "@linear/sdk";
import { Client as NotionClient } from "@notionhq/client";

export async function makeSlackRequest(
  userId: string,
  endpoint: string,
  method: string,
  body?: any
) {
  const integration = await getIntegration(userId, "slack");
  if (!integration) {
    throw new Error("Slack integration not found");
  }

  const res = await fetch(`https://slack.com/api/${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${integration.access_token}`,
    },
    body: JSON.stringify(body),
  });
  return await res.json();
}

export async function getNotionClient(userId: string) {
  const integration = await getIntegration(userId, "notion");
  if (!integration) {
    throw new Error("Notion integration not found");
  }
  return new NotionClient({ auth: integration.access_token! });
}

export async function getLinearClient(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const integration = await getIntegration(userId, "linear");

  if (!integration) {
    throw new Error("Linear integration not found");
  }

  return new LinearClient({ apiKey: integration.access_token! });
}

export function getDayBoundsInUTC(date: Date, timeZone: string) {
  const localeDate = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const [month, day, year] = localeDate.split("/");

  // Get start and end of day in user's time zone
  const startLocal = new Date(`${year}-${month}-${day}T00:00:00`);
  const endLocal = new Date(`${year}-${month}-${day}T23:59:59.999`);

  // Convert to UTC manually
  const utcStart = new Date(
    startLocal.toLocaleString("en-US", { timeZone: "UTC", hour12: false })
  );
  const utcEnd = new Date(
    endLocal.toLocaleString("en-US", { timeZone: "UTC", hour12: false })
  );

  return { timeMin: utcStart.toISOString(), timeMax: utcEnd.toISOString() };
}

export async function getIntegration(userId: string, name: string) {
  return IntegrationModel.findOne({ user_id: userId, name }).lean();
}

export function formatEvent(event: calendar_v3.Schema$Event) {
  const start = event.start?.dateTime || event.start?.date;
  const end = event.end?.dateTime || event.end?.date;

  const title = event.summary || "Untitled event";
  const location = event.location ? ` at ${event.location}` : "";
  const attendees = event.attendees?.length
    ? ` with ${event.attendees.map((a) => a.email).join(", ")}`
    : "";

  return `${title} — ${start} to ${end}${location}${attendees}`;
}

export function setupSSE(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
}

export function heartbeatStream(res: Response) {
  return setInterval(() => {
    res.write(":\n\n");
  }, 25_000);
}

export function encode({
  to,
  subject,
  body,
  inReplyTo,
}: {
  to: string;
  subject: string;
  body: string;
  inReplyTo?: string;
}) {
  const messageParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=utf-8`,
    `MIME-Version: 1.0`,
  ];

  if (inReplyTo) {
    messageParts.push(`In-Reply-To: ${inReplyTo}`);
    messageParts.push(`References: ${inReplyTo}`);
  }

  messageParts.push("", body);

  const message = messageParts.join("\n");
  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return encodedMessage;
}

export async function makeGithubRequest(
  url: string,
  method: string,
  body?: any
) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  return await res.json();
}
