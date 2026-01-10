import { IntegrationModel } from "../models/Integrations";
import { logger } from "../lib/logger";
import * as calendarAdapters from "./adapters/calendar";
import * as gmailAdapters from "./adapters/gmail";
import * as linearAdapters from "./adapters/linear";
import * as githubAdapters from "./adapters/github";
import * as slackAdapters from "./adapters/slack";

export default class Inbox {
  private readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
    logger.debug(`[Inbox] created for user ${this.userId}`);
  }

  private async getIntegrations() {
    logger.info(`[Inbox] Fetching integrations for user ${this.userId}`);
    try {
      const integrations = await IntegrationModel.find({
        user_id: this.userId,
      });
      logger.info(
        `[Inbox] Found ${
          Array.isArray(integrations) ? integrations.length : 0
        } integrations for user ${this.userId}`
      );
      return integrations;
    } catch (err) {
      logger.error(
        `[Inbox] Error fetching integrations for user ${this.userId}: ${err}`
      );
      throw err;
    }
  }

  async getMessages() {
    logger.info(`[Inbox] getMessages start for user ${this.userId}`);

    const integrationsArray = await this.getIntegrations();
    type Integration = (typeof integrationsArray)[number];
    const integrations = new Map<string, Integration>(
      integrationsArray.map((integration) => [integration.name, integration])
    );

    logger.debug(
      `[Inbox] Available integrations: ${integrationsArray
        .map((i) => i.name)
        .join(", ")}`
    );

    const data = {
      emails: [] as any[],
      calendarEvents: [] as any[],
      slackMessages: [] as any[],
      linearIssues: [] as any[],
      githubNotifications: [] as any[],
      githubIssues: [] as any[],
      githubPRs: [] as any[],
      lastUpdated: Date.now(),
    };

    // Slack
    if (integrations.has("slack")) {
      const slackIntegration = integrations.get("slack");
      logger.info(`[Inbox] Fetching Slack messages for user ${this.userId}`);

      try {
        const messages = await slackAdapters.getUnreadMessages(
          slackIntegration!.access_token
        );
        logger.info(
          `[Inbox] Retrieved ${
            Array.isArray(messages) ? messages.length : 0
          } Slack messages`
        );
        data.slackMessages.push(...messages);
      } catch (err) {
        logger.error(`[Inbox] Error fetching Slack messages: ${err}`);
      }
    } else {
      logger.debug(
        `[Inbox] Slack integration not found for user ${this.userId}`
      );
    }

    // Google
    if (integrations.has("google")) {
      const googleIntegration = integrations.get("google");
      logger.info(`[Inbox] Fetching Google data for user ${this.userId}`);

      // Calendar
      if (googleIntegration) {
        try {
          logger.debug(`[Inbox] Fetching today's calendar events`);
          const events = await calendarAdapters.listTodaysEvents(
            {
              calendarId: "primary",
              userId: this.userId,
            },
            {
              access_token: googleIntegration.access_token,
              refresh_token: googleIntegration.refresh_token as string,
              expires_at: googleIntegration.expires_at,
            }
          );

          logger.info(
            `[Inbox] Retrieved ${
              Array.isArray(events) ? events.length : 0
            } calendar events`
          );
          data.calendarEvents.push(...events);
        } catch (err) {
          logger.error(`[Inbox] Error fetching calendar events: ${err}`);
        }

        // Email
        try {
          logger.debug(`[Inbox] Fetching unread emails (limit 10)`);
          const emails = await gmailAdapters.listUnreadEmails(10, {
            access_token: googleIntegration.access_token,
            refresh_token: googleIntegration.refresh_token as string,
            expires_at: googleIntegration.expires_at,
          });

          logger.info(
            `[Inbox] Retrieved ${
              Array.isArray(emails) ? emails.length : 0
            } emails`
          );
          data.emails.push(...emails);
        } catch (err) {
          logger.error(`[Inbox] Error fetching unread emails: ${err}`);
        }
      }
    } else {
      logger.debug(
        `[Inbox] Google integration not found for user ${this.userId}`
      );
    }

    // GitHub
    if (integrations.has("github")) {
      logger.info("[Inbox Service] Fetching GitHub data");
      const githubIntegration = integrations.get("github");

      try {
        const notifications = await githubAdapters.listNotifications(
          false,
          false,
          githubIntegration!.access_token
        );
        logger.info(
          `[Inbox] Retrieved ${
            Array.isArray(notifications) ? notifications.length : 0
          } GitHub notifications`
        );
        data.githubNotifications.push(...notifications);
      } catch (err) {
        logger.error(`[Inbox] Error fetching GitHub notifications: ${err}`);
      }

      try {
        const issues = await githubAdapters.listIssues(
          "assigned",
          "open",
          githubIntegration!.access_token
        );
        logger.info(
          `[Inbox] Retrieved ${
            Array.isArray(issues) ? issues.length : 0
          } GitHub issues`
        );
        data.githubIssues.push(...issues);
      } catch (err) {
        logger.error(`[Inbox] Error fetching GitHub issues: ${err}`);
      }

      try {
        const prs = await githubAdapters.searchPullRequests(
          "is:open is:pr",
          githubIntegration!.access_token
        );
        logger.info(
          `[Inbox] Retrieved ${Array.isArray(prs) ? prs.length : 0} GitHub PRs`
        );
        console.log(prs);
        data.githubPRs.push(...prs);
      } catch (err) {
        logger.error(`[Inbox] Error fetching GitHub PRs: ${err}`);
      }
    } else {
      logger.debug(
        `[Inbox] GitHub integration not found for user ${this.userId}`
      );
    }

    // Linear
    if (integrations.has("linear")) {
      const linearIntegration = integrations.get("linear");
      logger.info(`[Inbox] Fetching Linear issues for user ${this.userId}`);

      try {
        const assignedIssues = await linearAdapters.getAssignedLinearIssues(
          linearIntegration!.access_token
        );
        logger.info(
          `[Inbox] Retrieved ${
            Array.isArray(assignedIssues) ? assignedIssues.length : 0
          } Linear issues`
        );
        data.linearIssues.push(...assignedIssues);
      } catch (err) {
        logger.error(`[Inbox] Error fetching Linear issues: ${err}`);
      }
    } else {
      logger.debug(
        `[Inbox] Linear integration not found for user ${this.userId}`
      );
    }

    data.lastUpdated = Date.now();
    logger.info(
      `[Inbox] getMessages completed for user ${this.userId} — emails: ${data.emails.length}, calendarEvents: ${data.calendarEvents.length}, slackMessages: ${data.slackMessages.length}, linearIssues: ${data.linearIssues.length}, githubNotifications: ${data.githubNotifications.length}, githubIssues: ${data.githubIssues.length}, githubPRs: ${data.githubPRs.length}`
    );
  }
}
