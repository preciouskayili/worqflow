import { Router } from "express";
import { createTask } from "../controllers/task";

const router = Router();

router.post("/", createTask);

export default router;
