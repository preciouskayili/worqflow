import { RequestHandler, Router } from "express";
import oauthRouter from "./oauth/index";
import authRouter from "./auth.ts";
import integrationsRouter from "./integrations";
import { requireAuth } from "../middleware/auth";
import taskRouter from "./task.ts";
import eventsRouter from "./events";
import homeRouter from "./home";
import webhooksRouter from "./webhooks";
import realtimeRouter from "./realtime";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "Hello from Worqai API" });
});

router.use("/auth", authRouter);
router.use("/oauth", requireAuth, oauthRouter);
router.use("/integrations", requireAuth, integrationsRouter);
router.use("/ai", requireAuth, taskRouter);
router.use("/home", requireAuth, homeRouter);
router.use("/webhooks", webhooksRouter);
router.use("/realtime", realtimeRouter);
router.use(
  "/streams",
  requireAuth,
  (req, _res, next) => {
    req.headers["x-no-compression"] = "1"; // disables compression early on the event route
    next();
  },
  eventsRouter
);
export default router;
