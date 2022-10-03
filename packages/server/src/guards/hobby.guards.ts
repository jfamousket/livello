import { has } from "lodash";
import is from "@sindresorhus/is";
import { IHobby, PassionLevel } from "../schemas/hobbies.schema";

type me = {
  famous: number;
};
export const isValidHobby = (
  hobby: Record<string, unknown>,
  keys: Array<keyof IHobby> = ["year", "name", "passionLevel"]
) => {
  return keys.every((key) => {
    switch (key) {
      case "name":
        return has(hobby, "name") && typeof hobby.name === "string";
      case "passionLevel":
        return (
          has(hobby, "passionLevel") &&
          is.enumCase(hobby.passionLevel, PassionLevel)
        );
      case "year":
        return has(hobby, "year") && is.safeInteger(hobby.year);
      default:
        return true;
    }
  });
};
