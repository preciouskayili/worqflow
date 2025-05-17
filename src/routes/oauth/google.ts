import { getGoogleOAuthUrlController } from "../../controllers/oauth/google";
import { getGoogleTokenController } from "../../controllers/oauth/google";
import { Router } from "express";

const router = Router();

router.get("/google", getGoogleOAuthUrlController);
router.get("/google/token", getGoogleTokenController);

export default router;
