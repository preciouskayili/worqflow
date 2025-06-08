import { Router } from "express";
import { createMessage } from "../controllers/chatMessage";

const router = Router();

// POST /chat/message
router.post("/", createMessage);

export default router;
