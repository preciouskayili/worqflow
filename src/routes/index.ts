import { Router } from "express";
import oauthRouter from "./oauth/google.ts";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "Hello from Worqai API" });
});

router.use("/oauth", oauthRouter);

export default router;
