import {
  getGoogleOAuthUrlController,
  googleCallbackController,
} from "../../controllers/oauth/google";
import { Router } from "express";

const router = Router();

router.get("/:user_id/google", getGoogleOAuthUrlController);
router.get("/google/callback", googleCallbackController);

export default router;
