import { Router } from "express";
import {
  getGoogleOAuthUrlController,
  getGoogleTokenController,
} from "../../controllers/oauth/google.ts";

const router = Router();

router.get("/google", getGoogleOAuthUrlController);
router.get("/google/token", getGoogleTokenController);

export default router;
