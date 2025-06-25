import {
  getGitHubOAuthUrlController,
  githubCallbackController,
} from "../../controllers/oauth/github";
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.get("/", requireAuth, getGitHubOAuthUrlController);
router.get("/callback", requireAuth, githubCallbackController);

export default router;
