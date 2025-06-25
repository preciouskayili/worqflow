import { Response } from "express";
import { getGitHubOAuthUrl, getGitHubToken } from "../../lib/githubapis";
import { IntegrationModel } from "../../models/Integrations";
import { AuthRequest } from "../../middleware/auth";
import { GITHUB_SCOPES } from "../../config/github_scopes";

// Step 1: build consent-screen URL
export async function getGitHubOAuthUrlController(
  req: AuthRequest,
  res: Response
) {
  const userId = req.user._id;
  const exists = await IntegrationModel.exists({
    user_id: userId,
    name: "github",
  });

  if (exists) {
    res.status(409).json({ message: "GitHub already connected" });
  } else {
    const url = await getGitHubOAuthUrl(GITHUB_SCOPES);
    res.json({ url });
  }
}

// Step 2: handle GitHub's redirect
export async function githubCallbackController(
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
      name: "github",
    });

    if (alreadyExists) {
      res.status(409).json({ message: "GitHub Account already connected" });
    } else {
      const tokens = await getGitHubToken(code!);

      await IntegrationModel.create({
        user_id: userId,
        name: "github",
        access_token: tokens.access_token,
        scope: tokens.scope,
      });

      res.status(200).json({ message: "GitHub connected" });
    }
  }
}
