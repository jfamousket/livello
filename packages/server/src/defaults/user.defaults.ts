import { IUser } from "../schemas/user.schema";

export const UserDefaults: {
  resProps: Array<keyof IUser>;
} = {
  resProps: ["name", "hobbies", "id"],
};
