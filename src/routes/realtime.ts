import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { setupSSE, heartbeatStream } from "../lib/misc";
import { Response } from "express";
import { syncUserData } from "../services/dataSync";
import { logger } from "../lib/logger";

const router = Router();

// SSE endpoint for real-time updates
router.get("/stream", requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user._id.toString();

  // Setup SSE
  setupSSE(res);

  // Send initial data
  try {
    const userData = await syncUserData(userId);
    res.write(`data: ${JSON.stringify({ type: "initial", data: userData })}\n\n`);
  } catch (error) {
    logger.error("Error sending initial data:", error);
    res.write(`data: ${JSON.stringify({ type: "error", message: "Failed to load data" })}\n\n`);
  }

  // Setup heartbeat
  const heartbeat = heartbeatStream(res);

  // Poll for updates every 30 seconds
  const pollInterval = setInterval(async () => {
    try {
      const userData = await syncUserData(userId);
      res.write(`data: ${JSON.stringify({ type: "update", data: userData })}\n\n`);
    } catch (error) {
      logger.error("Error polling for updates:", error);
    }
  }, 30000);

  // Cleanup on client disconnect
  req.on("close", () => {
    clearInterval(pollInterval);
    clearInterval(heartbeat);
    logger.info(`SSE connection closed for user ${userId}`);
  });
});

export default router;

