import { Router } from "express";
import googleRouter from "./google";
import slackRouter from "./slack";
import githubRouter from "./github";

const router = Router();

router.use("/google", googleRouter);
router.use("/slack", slackRouter);
router.use("/github", githubRouter);

export default router;
