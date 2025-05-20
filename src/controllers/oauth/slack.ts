import { Response } from "express";
import { getSlackOAuthUrl, getSlackToken } from "../../utils/slackapis";
import { IntegrationModel } from "../../models/Integrations";
import { AuthRequest } from "../../middleware/auth";
import { SLACK_SCOPES } from "../../config/slack_scopes";

// Step 1: build consent-screen URL
export async function getSlackOAuthUrlController(
  req: AuthRequest,
  res: Response
) {
  const userId = req.user._id;
  const exists = await IntegrationModel.exists({
    user_id: userId,
    name: "slack",
  });

  if (exists) {
    res.status(409).json({ message: "Slack already connected" });
  } else {
    const url = await getSlackOAuthUrl(SLACK_SCOPES);

    res.json({ url });
  }
}

// Step 2: handle Slack's redirect
export async function slackCallbackController(req: AuthRequest, res: Response) {
  const { code } = req.query as Record<string, string>;
  if (!code) {
    res.status(400).json({ message: "Missing code" });
  } else {
    const userId = req.user._id;

    const alreadyExists = await IntegrationModel.exists({
      user_id: userId,
      name: "slack",
    });

    if (alreadyExists) {
      res.status(409).json({ message: "Slack Account already connected" });
    } else {
      const tokens = await getSlackToken(code!);

      await IntegrationModel.create({
        user_id: userId,
        name: "slack",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
      });

      res.status(200).json({ message: "Slack connected" });
    }
  }
}
