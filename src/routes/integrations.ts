import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { IntegrationModel } from "../models/Integrations";

const router = Router();

// GET /integrations - Get all user integrations
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user._id;
    const integrations = await IntegrationModel.find({ user_id: userId });
    res.status(200).json({ integrations });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch integrations" });
  }
});

export default router;
