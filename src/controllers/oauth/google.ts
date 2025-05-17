import { Request, Response } from "express";
import { getGoogleOAuthUrl, getGoogleToken } from "../../utils/googleapis.ts";
import { IntegrationModel } from "../../models/Integrations.ts";

export async function getGoogleOAuthUrlController(req: Request, res: Response) {
  const scopes = ["https://www.googleapis.com/auth/calendar"];
  const user_id = req.params.user_id;

  if (user_id) {
    const integration = await IntegrationModel.findOne({
      user_id,
      name: "Google",
    });
    if (integration) {
      return res
        .status(200)
        .json({ message: "Google Account already connected" });
    }
  }

  const url = await getGoogleOAuthUrl(scopes);
  res.json({ url });
}

export async function getGoogleTokenController(req: Request, res: Response) {
  const code = req.query.code as string;
  const tokens = await getGoogleToken(code);

  const integration = await IntegrationModel.create({
    name: "Google",
    user_id: req.params.user_id,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expiry_date,
  });

  res.json(integration);
}
