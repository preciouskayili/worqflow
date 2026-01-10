import { calendar_v3 } from "googleapis";
import { IntegrationModel } from "../models/Integrations";
import { Response } from "express";
import { LinearClient } from "@linear/sdk";
import { Client as NotionClient } from "@notionhq/client";
import axios from "axios";
import crypto from "crypto";

export async function makeSlackRequest(
  access_token: string,
  endpoint: string,
  method: string,
  body?: any
) {
  const res = await fetch(`https://slack.com/api/${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${access_token}`,
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

export async function getLinearClient(access_token: string) {
  return new LinearClient({ apiKey: access_token });
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

export async function getFigmaClient(token: string) {
  return axios.create({
    baseURL: "https://api.figma.com/v1",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function formatEvent(event: calendar_v3.Schema$Event) {
  console.log(event);
  const start = event.start?.dateTime || event.start?.date;
  const end = event.end?.dateTime || event.end?.date;

  const title = event.summary || "Untitled event";
  const location = event.location ? ` at ${event.location}` : "";
  const attendees = event.attendees?.length
    ? ` with ${event.attendees.map((a) => a.email).join(", ")}`
    : "";

  return `${title} — ${start} to ${end}${location}${attendees}`;
}

export function getAvatarFromEmail(email?: string | null) {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  const hash = crypto.createHash("md5").update(clean).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
}

export function formatEmailMessage(msg: any) {
  // msg expected to have: id, snippet, headers (array of {name, value}), payload
  const headers = msg.headers || [];
  const from = headers.find((h: any) => h.name === "From")?.value || "";
  const subject =
    headers.find((h: any) => h.name === "Subject")?.value || "(no subject)";
  // try to extract name and email from From header
  const m = from.match(/(?:(.*) )?<([^>]+)>/);
  const name = m ? m[1]?.replace(/"/g, "")?.trim() : from;
  const email = m ? m[2] : from.includes("@") ? from : undefined;

  return {
    id: msg.id,
    type: "email",
    title: subject,
    text: msg.snippet || "",
    createdAt: msg.internalDate ? Number(msg.internalDate) : undefined,
    user: {
      name: name || undefined,
      email: email || undefined,
      avatar: getAvatarFromEmail(email),
    },
    raw: msg,
  };
}

export function formatSlackMessage(msg: any) {
  // expected msg: { channel, time, text, user, user_profile }
  return {
    id: `${msg.channel || "slack"}-${msg.time}`,
    type: "slack",
    title: msg.channel || "Slack",
    text: msg.text || "",
    createdAt: msg.time
      ? Number(Math.floor(Number(msg.time) * 1000))
      : undefined,
    user: {
      id: msg.user || undefined,
      name:
        msg.user_profile?.real_name ||
        msg.user_profile?.display_name ||
        undefined,
      username: msg.user_profile?.name || undefined,
      avatar: msg.user_profile?.image_72 || undefined,
    },
    raw: msg,
  };
}

export function formatGithubNotification(n: any) {
  // n: notification object from GitHub
  return {
    id: n.id,
    type: "github",
    title: n.subject?.title || n.repository?.full_name || "GitHub",
    text: `${n.repository?.full_name || ""} — ${
      n.subject?.type || "notification"
    }`,
    createdAt: n.updated_at ? new Date(n.updated_at).getTime() : undefined,
    user: {
      // GitHub notification doesn't include actor; leave undefined
      name: undefined,
      username: undefined,
      avatar: undefined,
    },
    raw: n,
  };
}

export function formatLinearIssue(issue: any) {
  return {
    id: issue.id,
    type: "linear",
    title: issue.title,
    text: issue.description || issue.identifier || "",
    createdAt: issue.updatedAt
      ? new Date(issue.updatedAt).getTime()
      : undefined,
    user: {
      id: issue.assignee?.id,
      name: issue.assignee?.name,
      email: issue.assignee?.email,
      avatar: issue.assignee?.avatarUrl || undefined,
    },
    raw: issue,
  };
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
