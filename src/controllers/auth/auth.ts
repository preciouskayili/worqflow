import { Request, Response } from "express";
import { UserModel } from "../../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function registerController(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ message: "Invalid input", errors: parsed.error.errors });
  } else {
    const { email, password, name } = parsed.data;
    const existing = await UserModel.findOne({ email });
    if (existing) {
      res.status(409).json({ message: "Email already registered" });
    } else {
      const hashed = await bcrypt.hash(password, 10);
      const user = await UserModel.create({ email, password: hashed, name });
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(201).json({
        token,
        user: { email: user.email, name: user.name, id: user._id },
      });
    }
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginController(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ message: "Invalid input", errors: parsed.error.errors });
  } else {
    const { email, password } = parsed.data;
    const user = await UserModel.findOne({ email });
    if (!user || !user.password) {
      res.status(401).json({ message: "Invalid credentials" });
    } else {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        res.status(401).json({ message: "Invalid credentials" });
      } else {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
          expiresIn: "7d",
        });
        res.status(200).json({
          token,
          user: { email: user.email, name: user.name, id: user._id },
        });
      }
    }
  }
}
