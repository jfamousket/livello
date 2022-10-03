import { IHobby } from "../schemas/hobbies.schema";

export const HobbyDefaults: {
  resProps: Array<keyof IHobby>;
} = {
  resProps: ["name", "passionLevel", "id", "year"],
};
