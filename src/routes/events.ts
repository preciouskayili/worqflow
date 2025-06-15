import { Router } from "express";
import { messageEvents } from "../controllers/events/chat";
const router = Router();

router.get("/messages/:threadId/:messageId", messageEvents);

export default router;
