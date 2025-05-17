import { Request, Response } from "express";
import { getGoogleOAuthUrl, getGoogleToken } from "../../utils/googleapis.ts";
import { IntegrationModel } from "../../models/Integrations.ts";
import { UserModel } from "../../models/User";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/documents.readonly",
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

/* ---------- Step 1: build consent-screen URL ---------- */
export async function getGoogleOAuthUrlController(req: Request, res: Response) {
  const userId = req.params.user_id; // session / JWT
  const exists = await IntegrationModel.exists({
    user_id: userId,
    name: "google",
  });

  if (exists) {
    res.status(409).json({ message: "Google already connected" });
  } else {
    // signed state = userId.nonce.sig
    const nonce = crypto.randomBytes(12).toString("hex");
    const payload = `${userId}.${nonce}`;
    const sig = crypto
      .createHmac("sha256", process.env.STATE_SECRET!)
      .update(payload)
      .digest("hex");
    const state = `${payload}.${sig}`;

    const url = await getGoogleOAuthUrl(SCOPES, state);
    res.json({ url });
  }
}

/* ---------- Step 2: handle Google's redirect ---------- */
export async function googleCallbackController(req: Request, res: Response) {
  const { code, state } = req.query as Record<string, string>;
  if (!code || !state) {
    res.status(400).json({ message: "Missing code/state" });
  } else {
    const [userId, nonce, sig] = state.split(".");
    const validSig = crypto
      .createHmac("sha256", process.env.STATE_SECRET!)
      .update(`${userId}.${nonce}`)
      .digest("hex");

    if (sig !== validSig) {
      res.status(400).json({ message: "Invalid state" });
    } else {
      const alreadyExists = await IntegrationModel.exists({
        user_id: userId,
        name: "google",
      });

      if (alreadyExists) {
        res.status(409).json({ message: "Google Account already connected" });
      } else {
        const tokens = await getGoogleToken(code!);
        // Get user info from Google
        const userinfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          }
        );
        const userinfo = await userinfoRes.json();
        // userinfo: { id, email, name, ... }
        let user = await UserModel.findOne({ email: userinfo.email });
        if (!user) {
          user = await UserModel.create({
            email: userinfo.email,
            name: userinfo.name,
            googleId: userinfo.id,
          });
        } else if (!user.googleId) {
          user.googleId = userinfo.id;
          await user.save();
        }
        await IntegrationModel.create({
          name: "google",
          user_id: userId,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date,
        });
        const JWT_SECRET = process.env.JWT_SECRET || "changeme";
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
          expiresIn: "7d",
        });
        res.status(200).json({
          message: "Google Account connected successfully",
          token,
          user: { email: user.email, name: user.name, id: user._id },
        });
      }
    }
  }
}
