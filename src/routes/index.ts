import { Router } from "express";
import oauthRouter from "./oauth/index";
import authRouter from "./auth.ts";
import integrationsRouter from "./integrations";
import chatHistoryRouter from "./chatHistory";
import chatMessageRouter from "./chatMessage";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "Hello from Worqai API" });
});

router.use("/auth", authRouter);
router.use("/oauth", requireAuth, oauthRouter);
router.use("/integrations", requireAuth, integrationsRouter);
router.use("/chat", chatHistoryRouter);
router.use("/chat", chatMessageRouter);

export default router;
