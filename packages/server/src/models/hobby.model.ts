import { model } from "mongoose";
import { HobbySchema, IHobby } from "../schemas/hobbies.schema";

export const Hobby = model<IHobby>("Hobby", HobbySchema);
