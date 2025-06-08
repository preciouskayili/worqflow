import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  APP_PORT: Number(process.env.APP_PORT) || 8000,
  MONGODB_URI: process.env.MONGODB_URI || "",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "",
  API_VERSION: process.env.API_VERSION || "v1",
  STATE_SECRET: process.env.STATE_SECRET || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "",
  SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID || "",
  SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET || "",
  SLACK_REDIRECT_URI: process.env.SLACK_REDIRECT_URI || "",
};

export const MODEL = "gpt-4o-mini";
