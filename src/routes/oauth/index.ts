import { Router } from "express";
import googleRouter from "./google";
import slackRouter from "./slack";

const router = Router();

router.use("/google", googleRouter);
router.use("/slack", slackRouter);

export default router;
