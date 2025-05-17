import { Request, Response } from "express";
import { getGoogleOAuthUrl, getGoogleToken } from "../../utils/googleapis.ts";
import { IntegrationModel } from "../../models/Integrations.ts";

export async function getGoogleOAuthUrlController(req: Request, res: Response) {
  const scopes = ["https://www.googleapis.com/auth/calendar"];
  const user_id = req.params.user_id;

  if (!user_id) {
    res.status(400).json({ message: "User ID is required" });
  } else {
    const integration = await IntegrationModel.findOne({
      user_id,
      name: "Google",
    });

    if (integration) {
      res.status(409).json({ message: "Google Account already connected" });
    } else {
      const url = await getGoogleOAuthUrl(scopes);
      res.status(200).json({ url });
    }
  }
}

export async function getGoogleTokenController(req: Request, res: Response) {
  const code = req.query.code as string;
  const user_id = req.params.user_id;

  if (!user_id) {
    res.status(400).json({ message: "User ID is required" });
  } else {
    const tokens = await getGoogleToken(code);

    const integration = await IntegrationModel.create({
      name: "Google",
      user_id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expiry_date,
    });

    res.status(201).json(integration);
  }
}
