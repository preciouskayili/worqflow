import {
  getSlackOAuthUrlController,
  slackCallbackController,
} from "../../controllers/oauth/slack";
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.get("/", requireAuth, getSlackOAuthUrlController);
router.get("/callback", requireAuth, slackCallbackController);

export default router;
