import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string; // hashed, optional for Google users
  name?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const UserModel = model<IUser>("User", UserSchema);
