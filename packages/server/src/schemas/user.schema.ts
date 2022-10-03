import { InferSchemaType, Schema, Types } from "mongoose";
import { Hobby } from "../models/hobby.model";

export const UserSchema = new Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
  hobbies: [{ type: Types.ObjectId, ref: Hobby }],
});

export type IUser = InferSchemaType<typeof UserSchema>;
