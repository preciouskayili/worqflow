import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();

const auth = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function getGoogleOAuthUrl(scopes: string[]) {
  const url = auth.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });

  return url;
}

export async function getGoogleToken(code: string) {
  const { tokens } = await auth.getToken(code);
  auth.setCredentials(tokens);
  return tokens;
}


