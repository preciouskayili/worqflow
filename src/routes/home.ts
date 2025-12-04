import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getHomePage } from "../controllers/home";

const router = Router();

router.get("/", requireAuth, getHomePage);

export default router;

