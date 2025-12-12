import cron from "node-cron";
import { IntegrationModel } from "../models/Integrations";
import { syncUserData, invalidateUserCache } from "./dataSync";
import { logger } from "../lib/logger";

// Background job to sync user data periodically
class BackgroundSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Sync data for all active users every 2 minutes
  start() {
    if (this.isRunning) {
      logger.warn("Background sync service is already running");
      return;
    }

    this.isRunning = true;
    logger.info("Starting background sync service");

    // Run every 2 minutes
    cron.schedule("*/2 * * * *", async () => {
      await this.syncAllUsers();
    });

    // Also run immediately on start
    this.syncAllUsers().catch((err) => {
      logger.error("Error in initial background sync:", err);
    });
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    logger.info("Background sync service stopped");
  }

  private async syncAllUsers() {
    try {
      // Get all users with at least one integration
      const integrations = await IntegrationModel.distinct("user_id");

      logger.info(`Syncing data for ${integrations.length} users`);

      // Sync in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < integrations.length; i += batchSize) {
        const batch = integrations.slice(i, i + batchSize);

        await Promise.allSettled(
          batch.map((userId) =>
            syncUserData(userId.toString()).catch((err) => {
              logger.error(`Error syncing user ${userId}:`, err);
            })
          )
        );

        // Small delay between batches to avoid rate limits
        if (i + batchSize < integrations.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      logger.info("Background sync completed");
    } catch (error) {
      logger.error("Error in background sync:", error);
    }
  }

  // Force sync for a specific user (useful for webhooks)
  async syncUser(userId: string) {
    try {
      invalidateUserCache(userId);
      await syncUserData(userId);
      logger.info(`Forced sync completed for user ${userId}`);
    } catch (error) {
      logger.error(`Error syncing user ${userId}:`, error);
      throw error;
    }
  }
}

export const backgroundSyncService = new BackgroundSyncService();
