import { RequestHandler, Router } from "express";
import oauthRouter from "./oauth/index";
import authRouter from "./auth.ts";
import integrationsRouter from "./integrations";
import { requireAuth } from "../middleware/auth";
import taskRouter from "./task.ts";
import eventsRouter from "./events";
import inboxRouter from "./inbox";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "Hello from Worqai API" });
});

router.use("/auth", authRouter);
router.use("/oauth", requireAuth, oauthRouter);
router.use("/integrations", requireAuth, integrationsRouter);
router.use("/ai", requireAuth, taskRouter);
router.use("/inbox", requireAuth, inboxRouter);
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
