import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { handleChatMessage } from "../controllers/chatMessage";

const router = Router();

// POST /chat/message
router.post("/message", requireAuth, (req, res) => handleChatMessage(req as AuthRequest, res));

export default router;
