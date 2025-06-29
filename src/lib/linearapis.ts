import axios from "axios";
import { env } from "../config/env";

const LINEAR_CLIENT_ID = env.LINEAR_CLIENT_ID;
const LINEAR_CLIENT_SECRET = env.LINEAR_CLIENT_SECRET;
const LINEAR_REDIRECT_URI = env.LINEAR_REDIRECT_URI;

export async function getLinearOAuthUrl(scopes: string[]) {
  const params = new URLSearchParams({
    client_id: LINEAR_CLIENT_ID,
    scope: scopes.join(" "),
    redirect_uri: LINEAR_REDIRECT_URI,
    response_type: "code",
  });
  return `https://linear.app/oauth/authorize?${params.toString()}`;
}

export async function getLinearToken(code: string) {
  const response = await axios.post(
    "https://api.linear.app/oauth/token",
    {
      client_id: LINEAR_CLIENT_ID,
      client_secret: LINEAR_CLIENT_SECRET,
      code,
      redirect_uri: LINEAR_REDIRECT_URI,
      grant_type: "authorization_code",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (response.data.error) {
    throw new Error(`Linear OAuth error: ${response.data.error_description}`);
  }

  return {
    access_token: response.data.access_token,
    scope: response.data.scope,
  };
}
