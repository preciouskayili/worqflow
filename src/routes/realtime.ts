import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { setupSSE, heartbeatStream } from "../lib/misc";
import { Response, NextFunction } from "express";
import { logger } from "../lib/logger";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";
import { formatHomePageData } from "../services/homeDataFormatter";
import { env } from "../config/env";

const router = Router();

// SSE endpoint for real-time updates
// Supports both Bearer token in header and token in query param (for EventSource)
router.get(
  "/stream",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check for token in query param (for EventSource compatibility)
    const queryToken = req.query.token as string;
    if (queryToken) {
      // Manually verify token and set user
      try {
        const JWT_SECRET = env.JWT_SECRET || "changeme";
        const payload = jwt.verify(queryToken, JWT_SECRET) as any;
        const user = await UserModel.findById(payload.userId);
        if (user) {
          req.user = user;
          return next();
        }
        return res.status(401).json({ error: "User not found" });
      } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
          return res.status(401).json({ error: "Token expired" });
        }
        if (err instanceof jwt.JsonWebTokenError) {
          return res.status(401).json({ error: "Invalid token" });
        }
        logger.error("Error verifying token in realtime route:", err);
        return res.status(401).json({ error: "Invalid token" });
      }
    }
    // Fall back to standard auth middleware
    requireAuth(req, res, next);
  },
  async (req: AuthRequest, res: Response) => {
    const userId = req.user._id.toString();

    // Setup SSE
    setupSSE(res);

    // Get user name for greeting
    const user = await UserModel.findById(userId);
    const userName = user?.name.split(" ")[0] || "User";

    // Send initial data - formatted like the home endpoint
    const sendHomeData = async () => {
      try {
        const homeData = await formatHomePageData(userId, userName);
        res.write(
          `data: ${JSON.stringify({
            type: "update",
            data: homeData,
          })}\n\n`
        );
      } catch (error) {
        logger.error("Error sending data:", error);
        res.write(
          `data: ${JSON.stringify({
            type: "error",
            message: "Failed to load data",
          })}\n\n`
        );
      }
    };

    // Send initial data
    await sendHomeData();

    // Setup heartbeat
    const heartbeat = heartbeatStream(res);

    // Poll for updates every 30 seconds
    const pollInterval = setInterval(async () => {
      await sendHomeData();
    }, 30000);

    // Cleanup on client disconnect
    req.on("close", () => {
      clearInterval(pollInterval);
      clearInterval(heartbeat);
      logger.info(`SSE connection closed for user ${userId}`);
    });
  }
);

export default router;
