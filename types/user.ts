import { Types } from "mongoose";

export type UserInfo = {
  access_token: string;
  refresh_token: string;
  expires_at?: string;
  userId: string | Types.ObjectId;
};
