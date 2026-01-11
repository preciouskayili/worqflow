import { IntegrationModel } from "../models/Integrations";
import { logger } from "../lib/logger";
import * as calendarAdapters from "./adapters/calendar";
import * as gmailAdapters from "./adapters/gmail";
import * as linearAdapters from "./adapters/linear";
import * as slackAdapters from "./adapters/slack";
import Cache from "../lib/cache";

const cache = new Cache();

export default class Inbox {
  private readonly userId: string;
  cacheKey: string;
  cachedData?: any;

  constructor(userId: string) {
    this.userId = userId;
    this.cacheKey = `inbox-data-${this.userId}`;
    this.cachedData = cache.get(this.cacheKey);

    logger.debug(`[Inbox] created for user ${this.userId}`);
  }

  private async getIntegrations() {
    logger.info(`[Inbox] Fetching integrations for user ${this.userId}`);
    const integrations = await IntegrationModel.find({
      user_id: this.userId,
    });
    return new Map(integrations.map((i) => [i.name, i]));
  }

  async getMessages() {
    logger.info(`[Inbox] getMessages start for user ${this.userId}`);

    if (this.cachedData && Date.now() - this.cachedData.lastUpdated < 30000) {
      logger.info(
        `[Inbox] returning cached data for user ${this.userId} (cached ${
          Date.now() - this.cachedData.lastUpdated
        } ms ago)`
      );
      return this.cachedData;
    }

    const integrations = await this.getIntegrations();

    const data = {
      emails: [] as any[],
      calendarEvents: [] as any[],
      slackMessages: [] as any[],
      linearIssues: [] as any[],
      lastUpdated: Date.now(),
    };

    await Promise.all([
      this.getSlack(integrations, data),
      this.getGoogle(integrations, data),
      this.getLinear(integrations, data),
    ]);

    data.lastUpdated = Date.now();

    logger.info(
      `[Inbox] completed for user ${this.userId} — emails: ${data.emails.length}, calendarEvents: ${data.calendarEvents.length}, slackMessages: ${data.slackMessages.length}, linearIssues: ${data.linearIssues.length}`
    );

    // Cache the result for 30 seconds
    cache.set(`inbox-data-${this.userId}`, data, 30000);

    return data;
  }

  // Slack
  private async getSlack(integrations: Map<string, any>, data: any) {
    if (!integrations.has("slack")) {
      logger.debug(`[Inbox] Slack integration not found`);
      return;
    }

    logger.info(`[Inbox] Fetching Slack messages`);
    const integration = integrations.get("slack");

    try {
      const messages = await slackAdapters.getUnreadMessages(
        integration.access_token
      );
      data.slackMessages.push(...messages);
    } catch (err) {
      logger.error(`[Inbox] Slack fetch failed: ${err}`);
    }
  }

  // Google
  private async getGoogle(integrations: Map<string, any>, data: any) {
    if (!integrations.has("google")) {
      logger.debug(`[Inbox] Google integration not found`);
      return;
    }

    logger.info(`[Inbox] Fetching Google data`);
    const integration = integrations.get("google");

    await this.getCalendar(integration, data);
    await this.getEmails(integration, data);
  }

  private async getCalendar(integration: any, data: any) {
    try {
      const events = await calendarAdapters.listTodaysEvents(
        { calendarId: "primary", userId: this.userId },
        {
          access_token: integration.access_token,
          refresh_token: integration.refresh_token,
          expires_at: integration.expires_at,
        }
      );
      data.calendarEvents.push(...events);
    } catch (err) {
      logger.error(`[Inbox] Calendar fetch failed: ${err}`);
    }
  }

  private async getEmails(integration: any, data: any) {
    try {
      const emails = await gmailAdapters.listUnreadEmails(10, {
        access_token: integration.access_token,
        refresh_token: integration.refresh_token,
        expires_at: integration.expires_at,
      });
      data.emails.push(...emails);
    } catch (err) {
      logger.error(`[Inbox] Email fetch failed: ${err}`);
    }
  }

  // Linear
  private async getLinear(integrations: Map<string, any>, data: any) {
    if (!integrations.has("linear")) {
      logger.debug(`[Inbox] Linear integration not found`);
      return;
    }

    logger.info(`[Inbox] Fetching Linear issues`);
    const integration = integrations.get("linear");

    try {
      const issues = await linearAdapters.getAssignedLinearIssues(
        integration.access_token
      );
      data.linearIssues.push(...issues);
    } catch (err) {
      logger.error(`[Inbox] Linear fetch failed: ${err}`);
    }
  }
}
