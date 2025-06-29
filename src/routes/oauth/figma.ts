import {
  getFigmaOAuthUrlController,
  figmaCallbackController,
} from "../../controllers/oauth/figma";
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.get("/", requireAuth, getFigmaOAuthUrlController);
router.get("/callback", requireAuth, figmaCallbackController);

export default router;
