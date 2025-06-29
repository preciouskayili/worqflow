import {
  getLinearOAuthUrlController,
  linearCallbackController,
} from "../../controllers/oauth/linear";
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.get("/", requireAuth, getLinearOAuthUrlController);
router.get("/callback", requireAuth, linearCallbackController);

export default router;
