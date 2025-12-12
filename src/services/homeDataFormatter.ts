import { syncUserData } from "./dataSync";
import * as gmailAdapters from "./adapters/gmail";
import { IntegrationModel } from "../models/Integrations";
import { getCalendarService } from "../lib/googleapis";
import { getDayBoundsInUTC } from "../lib/misc";
import openai from "../lib/openai";
import { MODEL } from "../config/env";

interface InboxItem {
  id: string;
  source: "gmail" | "slack" | "calendar" | "linear" | "github";
  title: string;
  description: string;
  timestamp?: string;
  metadata?: any;
}

interface ScheduleItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  joinLink?: string;
  description?: string;
}

export interface HomePageResponse {
  greeting: string;
  schedule: ScheduleItem | null;
  inbox: InboxItem[];
  lastUpdated: number;
}

// Helper function to get greeting based on time of day
function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name.split(" ")[0]}`;
  if (hour < 18) return `Good afternoon, ${name.split(" ")[0]}`;
  return `Good evening, ${name.split(" ")[0]}`;
}

// Helper function to summarize with LLM
async function summarizeWithLLM(
  items: Array<{ source: string; rawData: any }>
): Promise<InboxItem[]> {
  if (items.length === 0) return [];

  // Format items for better LLM understanding
  const formattedItems = items.map((item, index) => {
    if (item.source === "gmail") {
      const headers = item.rawData.headers || [];
      const from =
        headers.find((h: any) => h.name === "From")?.value || "Unknown";
      const subject =
        headers.find((h: any) => h.name === "Subject")?.value || "No subject";
      return {
        index,
        source: "gmail",
        from,
        subject,
        snippet: item.rawData.snippet || "",
        timestamp: item.rawData.timestamp,
      };
    } else if (item.source === "slack") {
      return {
        index,
        source: "slack",
        channel: item.rawData.channel || "Unknown channel",
        text: item.rawData.text || "",
        timestamp: item.rawData.time,
      };
    } else if (item.source === "calendar") {
      const startTime =
        item.rawData.start?.dateTime || item.rawData.start?.date;
      const startDate = startTime ? new Date(startTime) : null;
      const minutesUntil = startDate
        ? Math.round((startDate.getTime() - Date.now()) / 60000)
        : null;
      return {
        index,
        source: "calendar",
        summary: item.rawData.summary || "Upcoming event",
        description: item.rawData.description || "",
        startTime,
        minutesUntil,
        hangoutLink: item.rawData.hangoutLink,
      };
    } else if (item.source === "linear") {
      return {
        index,
        source: "linear",
        title: item.rawData.title || "Linear issue",
        description: item.rawData.description || "",
        state: item.rawData.state?.name,
        team: item.rawData.team?.name,
        priority: item.rawData.priority,
        createdAt: item.rawData.createdAt,
      };
    } else if (item.source === "github") {
      return {
        index,
        source: "github",
        title:
          item.rawData.title ||
          item.rawData.subject?.title ||
          "GitHub notification",
        body: item.rawData.body || item.rawData.subject?.body || "",
        repository:
          item.rawData.repository?.name || item.rawData.repository?.full_name,
        type: item.rawData.subject?.type || "notification",
        updatedAt: item.rawData.updated_at || item.rawData.updatedAt,
      };
    }
    return { index, source: item.source, ...item.rawData };
  });

  const prompt = `You are a helpful assistant that summarizes notifications and messages for a productivity dashboard. 

Given the following items from different sources, create concise, actionable summaries for each. Return a JSON array where each item has:
- id: use "item-{index}" format
- source: the source (gmail, slack, calendar, linear, or github)
- title: a short, descriptive title (max 50 chars). For Gmail: use subject or sender name. For Slack: mention channel. For Calendar: mention event name and time until. For Linear: use issue title. For GitHub: use PR/issue title.
- description: a brief description of what needs attention (max 100 chars). Be specific and actionable.
- timestamp: ISO timestamp if available
- metadata: include relevant info like channel name, sender email, join link, issue ID, etc.

Items to summarize:
${JSON.stringify(formattedItems, null, 2)}

Return ONLY a valid JSON array, no other text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that formats notifications as JSON. Always return valid JSON arrays only. Never include markdown code blocks, just the raw JSON array.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return [];

    // Try to parse JSON
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      if (parsed.items && Array.isArray(parsed.items)) {
        return parsed.items;
      }
      if (parsed.data && Array.isArray(parsed.data)) {
        return parsed.data;
      }
    } catch {
      // Try to extract JSON array
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    // Fallback to basic summaries
    return items.map((item, index) => {
      let title = `Notification from ${item.source}`;
      let description = "New item requires your attention";

      if (item.source === "gmail") {
        const headers = item.rawData.headers || [];
        const subject = headers.find((h: any) => h.name === "Subject")?.value;
        const from = headers.find((h: any) => h.name === "From")?.value;
        title = subject || from || title;
        description = item.rawData.snippet?.substring(0, 100) || description;
      } else if (item.source === "slack") {
        title = `Message in ${item.rawData.channel || "channel"}`;
        description = item.rawData.text?.substring(0, 100) || description;
      } else if (item.source === "calendar") {
        title = item.rawData.summary || "Upcoming event";
        const startTime =
          item.rawData.start?.dateTime || item.rawData.start?.date;
        if (startTime) {
          const minutesUntil = Math.round(
            (new Date(startTime).getTime() - Date.now()) / 60000
          );
          description = `Starts in ${minutesUntil} minutes`;
        }
      } else if (item.source === "linear") {
        title = item.rawData.title || "Linear issue";
        description =
          item.rawData.description?.substring(0, 100) ||
          `Issue in ${item.rawData.team?.name || "team"}`;
      } else if (item.source === "github") {
        title =
          item.rawData.title ||
          item.rawData.subject?.title ||
          "GitHub notification";
        description =
          item.rawData.body?.substring(0, 100) ||
          item.rawData.subject?.body?.substring(0, 100) ||
          "New GitHub activity";
      }

      return {
        id: `item-${index}`,
        source: item.source as InboxItem["source"],
        title,
        description,
        timestamp:
          item.rawData.timestamp ||
          item.rawData.time ||
          item.rawData.createdAt ||
          item.rawData.updatedAt,
        metadata: item.rawData,
      };
    });
  } catch (error) {
    console.error("Error summarizing with LLM:", error);
    return items.map((item, index) => ({
      id: `item-${index}`,
      source: item.source as InboxItem["source"],
      title: `Notification from ${item.source}`,
      description: "New item requires your attention",
      metadata: item.rawData,
    }));
  }
}

export async function formatHomePageData(
  userId: string,
  userName: string
): Promise<HomePageResponse> {
  // Sync user data (uses cache if available)
  const userData = await syncUserData(userId);

  const inboxItems: Array<{ source: string; rawData: any }> = [];
  let scheduleItem: ScheduleItem | null = null;

  // Process Gmail emails
  if (userData.emails.length > 0) {
    const googleIntegration = await IntegrationModel.findOne({
      user_id: userId,
      name: "google",
    });

    if (googleIntegration?.refresh_token) {
      const googleAuth = {
        access_token: googleIntegration.access_token,
        refresh_token: googleIntegration.refresh_token,
        expires_at: googleIntegration.expires_at?.toString(),
      };

      // Get detailed email info for top 3
      for (const email of userData.emails.slice(0, 3)) {
        if (email.id) {
          try {
            const emailDetails = await gmailAdapters.getEmailById(
              email.id,
              googleAuth
            );
            inboxItems.push({
              source: "gmail",
              rawData: {
                id: email.id,
                snippet: emailDetails.snippet,
                headers: emailDetails.payload?.headers,
                timestamp: emailDetails.internalDate,
              },
            });
          } catch (err) {
            console.error("Error fetching email details:", err);
          }
        }
      }
    }
  }

  // Process Calendar events
  if (userData.calendarEvents.length > 0) {
    const now = new Date();
    const currentEvents = userData.calendarEvents.filter((event: any) => {
      const start = new Date(event.start?.dateTime || event.start?.date || "");
      const end = new Date(event.end?.dateTime || event.end?.date || "");
      return start <= now && now <= end;
    });

    const upcomingEvents = userData.calendarEvents.filter((event: any) => {
      const startTime = new Date(
        event.start?.dateTime || event.start?.date || ""
      );
      return startTime >= now;
    });

    const eventToShow = currentEvents[0] || upcomingEvents[0];

    if (eventToShow) {
      const startTime = new Date(
        eventToShow.start?.dateTime || eventToShow.start?.date
      );
      const endTime = new Date(
        eventToShow.end?.dateTime || eventToShow.end?.date
      );

      // Format date as "9 Fri" format
      const dayOfMonth = startTime.getDate();
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = dayNames[startTime.getDay()];
      const dateStr = `${dayOfMonth} ${dayName}`;

      // Format time as "2:00 PM - 3:00 PM"
      const formatTime = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, "0");
        return `${displayHours}:${displayMinutes} ${ampm}`;
      };

      scheduleItem = {
        id: eventToShow.id || "unknown",
        title: eventToShow.summary || "Untitled Event",
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        date: dateStr,
        description: eventToShow.description,
        joinLink: eventToShow.hangoutLink || eventToShow.htmlLink,
      };

      // Add upcoming calendar events to inbox if they're starting soon
      const soonEvents = upcomingEvents.filter((event: any) => {
        const startTime = new Date(
          event.start?.dateTime || event.start?.date || ""
        );
        const minutesUntil = (startTime.getTime() - now.getTime()) / 60000;
        return minutesUntil > 0 && minutesUntil <= 60; // Next hour
      });

      for (const event of soonEvents.slice(0, 2)) {
        inboxItems.push({
          source: "calendar",
          rawData: {
            id: event.id,
            summary: event.summary,
            start: event.start,
            description: event.description,
            hangoutLink: event.hangoutLink,
          },
        });
      }
    }
  }

  // Process Slack messages
  for (const message of userData.slackMessages.slice(0, 3)) {
    inboxItems.push({
      source: "slack",
      rawData: {
        channel: message.channel,
        text: message.text,
        time: message.time,
      },
    });
  }

  // Process Linear issues
  for (const issue of userData.linearIssues.slice(0, 3)) {
    inboxItems.push({
      source: "linear",
      rawData: issue,
    });
  }

  // Process GitHub notifications and issues
  for (const notification of userData.githubNotifications.slice(0, 3)) {
    inboxItems.push({
      source: "github",
      rawData: notification,
    });
  }

  // Summarize inbox items with LLM
  const summarizedInbox = await summarizeWithLLM(inboxItems);

  return {
    greeting: getGreeting(userName),
    schedule: scheduleItem,
    inbox: summarizedInbox,
    lastUpdated: userData.lastUpdated,
  };
}
