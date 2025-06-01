import { Router } from "express";
import { storeChatHistory } from "../controllers/chatHistory";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /chat/history
router.post("/history", requireAuth, (req, res) => storeChatHistory(req as AuthRequest, res));

export default router;
