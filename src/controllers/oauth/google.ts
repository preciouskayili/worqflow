import { Request, Response } from "express";
import { getGoogleOAuthUrl, getGoogleToken } from "../../utils/googleapis.ts";
import { IntegrationModel } from "../../models/Integrations.ts";
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

        await IntegrationModel.create({
          name: "google",
          user_id: userId,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date,
        });

        res
          .status(200)
          .json({ message: "Google Account connected successfully" });
      }
    }
  }
}
