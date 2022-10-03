import { model } from "mongoose";
import { IUser, UserSchema } from "../schemas/user.schema";

export const User = model<IUser>("User", UserSchema);

