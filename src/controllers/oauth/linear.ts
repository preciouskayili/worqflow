import { Response } from "express";
import { getLinearOAuthUrl, getLinearToken } from "../../lib/linearapis";
import { IntegrationModel } from "../../models/Integrations";
import { AuthRequest } from "../../middleware/auth";
import { LINEAR_SCOPES } from "../../config/linear_scopes";

// Step 1: build consent-screen URL
export async function getLinearOAuthUrlController(
  req: AuthRequest,
  res: Response
) {
  const userId = req.user._id;
  const exists = await IntegrationModel.exists({
    user_id: userId,
    name: "linear",
  });

  if (exists) {
    res.status(409).json({ message: "Linear already connected" });
  } else {
    const url = await getLinearOAuthUrl(LINEAR_SCOPES);
    res.json({ url });
  }
}

// Step 2: handle Linear's redirect
export async function linearCallbackController(
  req: AuthRequest,
  res: Response
) {
  const { code } = req.query as Record<string, string>;
  if (!code) {
    res.status(400).json({ message: "Missing code" });
  } else {
    const userId = req.user._id;

    const alreadyExists = await IntegrationModel.exists({
      user_id: userId,
      name: "linear",
    });

    if (alreadyExists) {
      res.status(409).json({ message: "Linear Account already connected" });
    } else {
      const tokens = await getLinearToken(code!);

      await IntegrationModel.create({
        user_id: userId,
        name: "linear",
        access_token: tokens.access_token,
        scope: tokens.scope,
      });

      res.status(200).json({ message: "Linear connected" });
    }
  }
}
