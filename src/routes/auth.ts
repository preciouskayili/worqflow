import { Router } from "express";
import { registerController, loginController } from "../controllers/auth/auth";
import { requireAuth } from "../middleware/auth";
import { AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);

// Get current user info
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: (req as AuthRequest).user });
});

export default router;
