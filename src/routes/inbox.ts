import { Router } from "express";
import Inbox from "../services/inbox";
import { AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  const inbox = new Inbox(req.user._id);
  const messages = await inbox.getMessages();

  res.json({ messages });
});

export default router;
