import { getSlackOAuthUrl, slackCallback } from "../../controllers/oauth/slack";
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.get("/", requireAuth, getSlackOAuthUrl);
router.get("/callback", requireAuth, slackCallback);

export default router;
