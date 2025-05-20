import { Router } from "express";
import oauthRouter from "./oauth/index";
import authRouter from "./auth.ts";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "Hello from Worqai API" });
});

router.use("/auth", authRouter);
router.use("/oauth", requireAuth, oauthRouter);

export default router;
