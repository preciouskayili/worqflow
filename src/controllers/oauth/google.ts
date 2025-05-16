import { Request, Response } from "express";
import { getGoogleOAuthUrl, getGoogleToken } from "../../utils/googleapis.ts";

export async function getGoogleOAuthUrlController(
  req: Request,
  res: Response
) {
  const scopes = ["https://www.googleapis.com/auth/calendar"];
  const url = await getGoogleOAuthUrl(scopes);
  res.redirect(url);
}

export async function getGoogleTokenController(req: Request, res: Response) {
  const code = req.query.code as string;
  const tokens = await getGoogleToken(code);
  res.json(tokens);
}
