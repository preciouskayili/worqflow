import { Router } from "express";
import {
  gmailWebhook,
  slackWebhook,
  githubWebhook,
  linearWebhook,
  triggerSync,
} from "../controllers/webhooks";

const router = Router();

// Webhook endpoints (no auth required - they use their own verification)
router.post("/gmail", gmailWebhook);
router.post("/slack", slackWebhook);
router.post("/github", githubWebhook);
router.post("/linear", linearWebhook);

// Manual sync trigger (should be protected in production)
router.post("/sync", triggerSync);

export default router;
