import axios from "axios";
import { env } from "../config/env";

const FIGMA_CLIENT_ID = env.FIGMA_CLIENT_ID;
const FIGMA_CLIENT_SECRET = env.FIGMA_CLIENT_SECRET;
const FIGMA_REDIRECT_URI = env.FIGMA_REDIRECT_URI;

export async function getFigmaOAuthUrl(scopes: string[]) {
  const params = new URLSearchParams({
    client_id: FIGMA_CLIENT_ID,
    scope: scopes.join(" "),
    redirect_uri: FIGMA_REDIRECT_URI,
    state: "figma_oauth",
  });
  return `https://www.figma.com/oauth?${params.toString()}`;
}

export async function getFigmaToken(code: string) {
  const response = await axios.post(
    "https://www.figma.com/api/oauth/token",
    {
      client_id: FIGMA_CLIENT_ID,
      client_secret: FIGMA_CLIENT_SECRET,
      code,
      redirect_uri: FIGMA_REDIRECT_URI,
      grant_type: "authorization_code",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (response.data.error) {
    throw new Error(`Figma OAuth error: ${response.data.error_description}`);
  }

  return {
    access_token: response.data.access_token,
    scope: response.data.scope,
  };
}
