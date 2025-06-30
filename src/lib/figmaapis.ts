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
    response_type: "code",
  });
  return `https://www.figma.com/oauth?${params.toString()}`;
}

export async function getFigmaToken(code: string) {
  const credentials = `${FIGMA_CLIENT_ID}:${FIGMA_CLIENT_SECRET}`;
  const encodedCredentials = Buffer.from(credentials).toString("base64");

  const response = await axios.post(
    "https://api.figma.com/v1/oauth/token",
    `redirect_uri=${encodeURIComponent(
      FIGMA_REDIRECT_URI
    )}&code=${encodeURIComponent(code)}&grant_type=authorization_code`,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${encodedCredentials}`,
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
