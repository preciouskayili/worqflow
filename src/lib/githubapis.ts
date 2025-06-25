import axios from "axios";
import { env } from "../config/env";
import { IntegrationModel } from "../models/Integrations";

const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = env.GITHUB_REDIRECT_URI;

export async function getGitHubOAuthUrl(scopes: string[]) {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: scopes.join(" "),
    redirect_uri: GITHUB_REDIRECT_URI,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function getGitHubToken(code: string) {
  const response = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: GITHUB_REDIRECT_URI,
    },
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (response.data.error) {
    throw new Error(`GitHub OAuth error: ${response.data.error_description}`);
  }

  return {
    access_token: response.data.access_token,
    scope: response.data.scope,
  };
}

export async function getGitHubIntegration(userId: string) {
  return IntegrationModel.findOne({ name: "github", user_id: userId }).lean();
}

export async function makeGitHubRequest(
  endpoint: string,
  method: string = "GET",
  data?: any,
  userId?: string
) {
  const integration = userId ? await getGitHubIntegration(userId) : null;

  if (!integration?.access_token) {
    throw new Error("GitHub integration not found or no access token");
  }

  const response = await axios({
    method,
    url: `https://api.github.com${endpoint}`,
    headers: {
      Authorization: `token ${integration.access_token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "WorqAI-App",
    },
    data,
  });

  return response.data;
}
