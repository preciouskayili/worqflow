import { Request, Response } from "express";
import { UserModel } from "../models/User";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import { Resend } from "resend";
import { logger } from "../lib/logger";

const resend = new Resend(env.RESEND_API_KEY);

const magicLinkRequestSchema = z.object({
  email: z
    .string({
      required_error: "Email address is required",
      message: "Invalid email address",
    })
    .email("Email address must be valid"),
  name: z.string().optional(), // Name is optional for login, required for registration
});

export async function requestMagicLinkController(req: Request, res: Response) {
  const parsed = magicLinkRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }
  
  try {
    const { email, name } = parsed.data;
    let user = await UserModel.findOne({ email });

    if (!user) {
      if (!name) {
        return res.status(400).json({ message: "Name is required for new users." });
      }
      user = await UserModel.create({ email, name });
    } else if (name && !user.name) {
      // Optionally update name if not set
      user.name = name;
      await user.save();
    }

    // Generate a secure, time-limited token (JWT)
    const magicLinkToken = jwt.sign(
      { userId: user._id, type: "magic" },
      env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    user.magicLinkToken = magicLinkToken;
    user.magicLinkExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    // Send magic link email
    const magicLinkUrl = `${
      env.FRONTEND_URL || "http://localhost:3000"
    }/auth/callback?token=${magicLinkToken}`;

    try {
      const result = await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: email,
        subject: "Your Magic Login Link",
        html: `<p>Click <a href="${magicLinkUrl}">here</a> to log in. This link expires in 15 minutes.</p>`,
      });

      if (result.error) {
        return res.status(500).json({ message: "Unable to send magic link" });
      }
      return res.status(200).json({ message: "Magic link sent if email exists." });
    } catch (err) {
      logger.error("Error sending magic link email:", err);
      return res.status(500).json({ message: "Unable to send magic link" });
    }
  } catch (error) {
    logger.error("Error in requestMagicLinkController:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function verifyMagicLinkController(req: Request, res: Response) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Missing token" });
  }
  
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "magic") {
      return res.status(401).json({ message: "Invalid token type" });
    }
    
    const user = await UserModel.findOne({
      _id: decoded.userId,
      magicLinkToken: token,
    });

    if (
      !user ||
      !user.magicLinkExpires ||
      user.magicLinkExpires < new Date()
    ) {
      return res.status(401).json({ message: "Invalid or expired magic link" });
    }
    
    user.magicLinkToken = undefined;
    user.magicLinkExpires = undefined;

    await user.save();

    // Issue access/refresh tokens
    const refreshToken = jwt.sign(
      { userId: user._id, type: "refresh" },
      env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    user.refreshToken = refreshToken;

    await user.save();

    const tokenJwt = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
      expiresIn: "15m",
    });

    return res.status(200).json({
      token: tokenJwt,
      refreshToken,
      user: { email: user.email, name: user.name, id: user._id },
    });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Magic link expired" });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid magic link token" });
    }
    logger.error("Error in verifyMagicLinkController:", err);
    return res.status(401).json({ message: "Invalid or expired magic link" });
  }
}

export async function refreshTokenController(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Missing refresh token" });
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token type" });
    }
    
    // Find user with this refresh token
    const user = await UserModel.findOne({
      _id: decoded.userId,
      refreshToken,
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    
    // Issue new access token
    const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
      expiresIn: "15m",
    });
    return res.status(200).json({ token });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Refresh token expired" });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    logger.error("Error in refreshTokenController:", err);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
}
