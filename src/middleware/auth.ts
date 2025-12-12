import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";
import { env } from "../config/env";

const JWT_SECRET = env.JWT_SECRET || "changeme";

export interface AuthRequest extends Request {
  user?: any;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }
  
  const token = authHeader.split("Bearer ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await UserModel.findById(payload.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    (req as AuthRequest).user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
