import { Router } from "express";
import googleRouter from "./google";
import slackRouter from "./slack";
import githubRouter from "./github";
import linearRouter from "./linear";
import figmaRouter from "./figma";

const router = Router();

router.use("/google", googleRouter);
router.use("/slack", slackRouter);
router.use("/github", githubRouter);
router.use("/linear", linearRouter);
router.use("/figma", figmaRouter);

export default router;
