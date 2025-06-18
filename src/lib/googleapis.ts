import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import { env } from "../config/env";
import { google } from "googleapis";
import { IntegrationModel } from "../models/Integrations";
dotenv.config();

const auth = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

export async function getIntegration(userId: string) {
  return IntegrationModel.findOne({ name: "google", user_id: userId }).lean();
}

export async function refreshAndSaveTokens(
  client: OAuth2Client,
  integration: any
) {
  client.on("tokens", async (tokens) => {
    const updates: any = {};
    if (tokens.access_token && tokens.access_token !== integration.access_token)
      updates.access_token = tokens.access_token;
    if (
      tokens.refresh_token &&
      tokens.refresh_token !== integration.refresh_token
    )
      updates.refresh_token = tokens.refresh_token;
    if (tokens.expiry_date) {
      const iso = new Date(tokens.expiry_date).toISOString();
      if (iso !== integration.expires_at?.toISOString())
        updates.expires_at = tokens.expiry_date;
    }

    if (Object.keys(updates).length) {
      updates.updated_at = new Date();
      await IntegrationModel.updateOne(
        { _id: integration._id },
        { $set: updates }
      );
    }
  });
}

export async function getCalendarService(integration: {
  access_token: string;
  refresh_token: string;
  expires_at?: string;
}) {
  if (!integration) throw new Error("No Google integration found");

  const client = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );

  client.setCredentials({
    access_token: integration.access_token!,
    refresh_token: integration.refresh_token!,
    expiry_date: integration.expires_at
      ? new Date(integration.expires_at).getTime()
      : 0,
  });

  await refreshAndSaveTokens(client, integration);

  await client.getAccessToken();

  return google.calendar({ version: "v3", auth: client });
}

export async function getGmailService(integration: {
  access_token: string;
  refresh_token: string;
  expires_at?: string;
}) {
  if (!integration) throw new Error("No Google integration found");

  const client = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );

  client.setCredentials({
    access_token: integration.access_token!,
    refresh_token: integration.refresh_token!,
    expiry_date: integration.expires_at
      ? new Date(integration.expires_at).getTime()
      : 0,
  });

  await refreshAndSaveTokens(client, integration);

  await client.getAccessToken();

  return google.gmail({ version: "v1", auth: client });
}

export async function getGoogleOAuthUrl(scopes: string[], state?: string) {
  const url = auth.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state,
    prompt: "consent",
  });

  return url;
}

export async function getGoogleToken(code: string) {
  const { tokens } = await auth.getToken(code);
  auth.setCredentials(tokens);
  return tokens;
}
