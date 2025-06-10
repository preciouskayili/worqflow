import { Router } from "express";
import { createTask } from "../controllers/task";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, createTask);

export default router;
