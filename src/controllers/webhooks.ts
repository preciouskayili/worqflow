import { Request, Response } from "express";
import { IntegrationModel } from "../models/Integrations";
import { invalidateUserCache } from "../services/dataSync";
import { backgroundSyncService } from "../services/backgroundSync";
import { logger } from "../lib/logger";

// Webhook endpoint for Gmail push notifications
export async function gmailWebhook(req: Request, res: Response) {
  try {
    // Gmail sends a challenge token for verification
    if (req.query["hub.challenge"]) {
      return res.status(200).send(req.query["hub.challenge"]);
    }

    // Handle actual webhook notification
    const { emailAddress, historyId } = req.body;
    
    if (emailAddress) {
      // Find user by email and invalidate their cache
      // Note: You'll need to store email -> userId mapping or query by integration
      const integration = await IntegrationModel.findOne({
        name: "google",
        // You might need to adjust this based on how you store user emails
      });

      if (integration) {
        invalidateUserCache(integration.user_id.toString());
        // Trigger immediate sync
        backgroundSyncService.syncUser(integration.user_id.toString()).catch(
          (err) => logger.error("Error syncing user after Gmail webhook:", err)
        );
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error("Error handling Gmail webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Webhook endpoint for Slack events
export async function slackWebhook(req: Request, res: Response) {
  try {
    // Slack URL verification
    if (req.body.type === "url_verification") {
      return res.status(200).json({ challenge: req.body.challenge });
    }

    // Handle Slack events
    const { event, team_id } = req.body;

    if (event && team_id) {
      // Find integration by team_id (you may need to store this)
      const integration = await IntegrationModel.findOne({
        name: "slack",
        // You might need to store team_id in the integration model
      });

      if (integration) {
        invalidateUserCache(integration.user_id.toString());
        backgroundSyncService.syncUser(integration.user_id.toString()).catch(
          (err) => logger.error("Error syncing user after Slack webhook:", err)
        );
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error("Error handling Slack webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Webhook endpoint for GitHub events
export async function githubWebhook(req: Request, res: Response) {
  try {
    const { action, repository, issue, pull_request } = req.body;

    // Find user by repository or other identifier
    // This is a simplified version - you may need to store repo -> user mapping
    const integration = await IntegrationModel.findOne({
      name: "github",
    });

    if (integration) {
      invalidateUserCache(integration.user_id.toString());
      backgroundSyncService.syncUser(integration.user_id.toString()).catch(
        (err) => logger.error("Error syncing user after GitHub webhook:", err)
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error("Error handling GitHub webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Webhook endpoint for Linear webhooks
export async function linearWebhook(req: Request, res: Response) {
  try {
    const { action, data } = req.body;

    // Linear webhook payload structure
    if (data?.issue || data?.project) {
      const integration = await IntegrationModel.findOne({
        name: "linear",
      });

      if (integration) {
        invalidateUserCache(integration.user_id.toString());
        backgroundSyncService.syncUser(integration.user_id.toString()).catch(
          (err) => logger.error("Error syncing user after Linear webhook:", err)
        );
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error("Error handling Linear webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Manual trigger endpoint for testing
export async function triggerSync(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await backgroundSyncService.syncUser(userId);
    res.status(200).json({ success: true, message: "Sync triggered" });
  } catch (error: any) {
    logger.error("Error triggering sync:", error);
    res.status(500).json({ error: error.message });
  }
}

