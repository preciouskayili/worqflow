import {
  getSlackOAuthUrlController,
  slackCallbackController,
} from "../../controllers/oauth/slack";
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";

const router = Router();

// Integration (connect Slack to existing user)
router.get("/", requireAuth, getSlackOAuthUrlController);
router.get("/callback", requireAuth, slackCallbackController);

export default router;
