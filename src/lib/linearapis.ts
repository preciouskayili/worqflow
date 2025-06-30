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
  const body = new URLSearchParams({
    client_id: LINEAR_CLIENT_ID,
    client_secret: LINEAR_CLIENT_SECRET,
    code,
    redirect_uri: LINEAR_REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://api.linear.app/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const tokens = await response.json();

  if (!response.ok) {
    console.error(tokens);
    throw new Error(`Linear OAuth error: ${response.statusText}`);
  }

  return {
    access_token: tokens.access_token,
    scope: tokens.scope,
    expires_in: tokens.expires_in,
  };
}
