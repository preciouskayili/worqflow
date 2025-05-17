import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import { env } from "../config/env";
dotenv.config();

const auth = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

export async function getGoogleOAuthUrl(scopes: string[], state?: string) {
  const url = auth.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state,
  });

  return url;
}

export async function getGoogleToken(code: string) {
  const { tokens } = await auth.getToken(code);
  auth.setCredentials(tokens);
  return tokens;
}
