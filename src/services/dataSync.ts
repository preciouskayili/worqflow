import { IntegrationModel } from "../models/Integrations";
import * as gmailAdapters from "./adapters/gmail";
import * as calendarAdapters from "./adapters/calendar";
import * as slackAdapters from "./adapters/slack";
import * as linearAdapters from "./adapters/linear";
import * as githubAdapters from "./adapters/github";
import { getCalendarService } from "../lib/googleapis";
import { getDayBoundsInUTC } from "../lib/misc";

// Simple in-memory cache (can be replaced with Redis for production)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class DataCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const dataCache = new DataCache();

export interface UserData {
  emails: any[];
  calendarEvents: any[];
  slackMessages: any[];
  linearIssues: any[];
  githubNotifications: any[];
  githubIssues: any[];
  githubPRs: any[];
  lastUpdated: number;
}

export async function syncUserData(userId: string): Promise<UserData> {
  const cacheKey = `user-data-${userId}`;
  const cached = dataCache.get<UserData>(cacheKey);

  // Return cached data if less than 30 seconds old
  if (cached && Date.now() - cached.lastUpdated < 30000) {
    return cached;
  }

  const data: UserData = {
    emails: [],
    calendarEvents: [],
    slackMessages: [],
    linearIssues: [],
    githubNotifications: [],
    githubIssues: [],
    githubPRs: [],
    lastUpdated: Date.now(),
  };

  // Fetch all integrations in parallel
  const [
    googleIntegration,
    slackIntegration,
    linearIntegration,
    githubIntegration,
  ] = await Promise.all([
    IntegrationModel.findOne({ user_id: userId, name: "google" }),
    IntegrationModel.findOne({ user_id: userId, name: "slack" }),
    IntegrationModel.findOne({ user_id: userId, name: "linear" }),
    IntegrationModel.findOne({ user_id: userId, name: "github" }),
  ]);

  // Fetch data from each service in parallel
  const fetchPromises: Promise<void>[] = [];

  // Gmail
  if (googleIntegration?.refresh_token) {
    const googleAuth = {
      access_token: googleIntegration.access_token,
      refresh_token: googleIntegration.refresh_token,
      expires_at: googleIntegration.expires_at?.toString(),
    };

    fetchPromises.push(
      gmailAdapters
        .listUnreadEmails(10, googleAuth)
        .then((emails) => {
          data.emails = emails;
        })
        .catch((err) => {
          console.error(`Error fetching Gmail for user ${userId}:`, err);
        })
    );

    // Calendar
    fetchPromises.push(
      (async () => {
        try {
          const calendars = await calendarAdapters.listCalendarList(
            { maxCapacity: 10, userId },
            googleAuth
          );

          if (calendars.length > 0) {
            const calendarService = await getCalendarService(googleAuth);
            const { timeMin, timeMax } = getDayBoundsInUTC(
              new Date(),
              "Africa/Lagos"
            );

            const eventsRes = await calendarService.events.list({
              calendarId: "primary",
              timeMin,
              timeMax,
              singleEvents: true,
              orderBy: "startTime",
              maxResults: 20,
            });

            console.log("===================");
            console.log(eventsRes.data);
            console.log("===================");

            data.calendarEvents = eventsRes.data.items || [];
          }
        } catch (err) {
          console.error(`Error fetching Calendar for user ${userId}:`, err);
        }
      })()
    );
  }

  // Slack
  if (slackIntegration) {
    fetchPromises.push(
      slackAdapters
        .getUnreadMessages(slackIntegration.access_token)
        .then((messages) => {
          data.slackMessages = messages;
        })
        .catch((err) => {
          console.error(`Error fetching Slack for user ${userId}:`, err);
        })
    );
  }

  // Linear
  if (linearIntegration) {
    fetchPromises.push(
      linearAdapters
        .getAssignedLinearIssues(linearIntegration.access_token)
        .then((issues) => {
          data.linearIssues = issues;
        })
        .catch((err) => {
          console.error(`Error fetching Linear for user ${userId}:`, err);
        })
    );
  }

  // GitHub
  if (githubIntegration) {
    fetchPromises.push(
      githubAdapters
        .listNotifications(false, false, githubIntegration.access_token)
        .then((notifications) => {
          data.githubNotifications = notifications.slice(0, 10);
        })
        .catch((err) => {
          console.error(
            `Error fetching GitHub notifications for user ${userId}:`,
            err
          );
        })
    );

    fetchPromises.push(
      githubAdapters
        .listIssues("assigned", "open", githubIntegration.access_token)
        .then((issues) => {
          data.githubIssues = issues.slice(0, 10);
        })
        .catch((err) => {
          console.error(
            `Error fetching GitHub issues for user ${userId}:`,
            err
          );
        })
    );

    // Get PRs (using search - note: searchPullRequests returns search results)
    fetchPromises.push(
      githubAdapters
        .searchPullRequests("is:open is:pr", githubIntegration.access_token)
        .then((prs) => {
          // The search returns { items: [...] } format from GitHub API
          const searchResults = prs as any;
          data.githubPRs = searchResults.items?.slice(0, 10) || [];
        })
        .catch((err) => {
          console.error(`Error fetching GitHub PRs for user ${userId}:`, err);
        })
    );
  }

  // Wait for all fetches to complete
  await Promise.allSettled(fetchPromises);

  // Cache the result for 30 seconds
  dataCache.set(cacheKey, data, 30000);

  return data;
}

// Invalidate cache for a user when data changes
export function invalidateUserCache(userId: string, source?: string): void {
  const pattern = `user-data-${userId}`;
  dataCache.invalidate(pattern);
}
