import { has } from "lodash";
import { IUser } from "../schemas/user.schema";
import is from '@sindresorhus/is'

export const isValidUser = (
  user: Record<string, unknown>,
  keys: Array<keyof IUser> = ["hobbies", "name"]
) => {
  return keys.every((key) => {
    switch (key) {
      case "name":
        return has(user, "name") && typeof user.name === "string";
      case "hobbies":
        return (
          has(user, "hobbies") &&
          Array.isArray(user.hobbies) &&
          user.hobbies.every(is.string)
        );
      default:
        return true;
    }
  });
};
