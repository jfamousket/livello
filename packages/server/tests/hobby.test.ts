import { Hobby } from "../src/models/hobby.model";
import { User } from "../src/models/user.model";
import { IHobby } from "../src/schemas/hobbies.schema";
import { connectDB, disconnectDB, request } from "./setup";

describe("User Endpoint Tests", () => {
  let userId: string = "";
  beforeAll(async () => {
    await connectDB();
    const user = new User({ hobbies: [], name: "famous" });
    user.id = user._id.toString();
    await user.save();
    userId = user.id;
  });

  afterAll(async () => {
    await Hobby.collection.drop();
    await User.collection.drop();
    await disconnectDB();
  });

  it("Get all hobbies", () => {
    return request
      .get("/hobbies")
      .then((hobbies) => expect(hobbies.data).toEqual([]));
  });

  let hobby: IHobby;
  it("Create hobby", () => {
    return request
      .post<IHobby>("/hobby", {
        name: "Singing",
        passionLevel: 0,
        year: 2020,
        userId,
      })
      .then((res) => {
        expect(res.data.name).toEqual("Singing");
        hobby = res.data;
      });
  });

  it("Read hobby", () => {
    return request.get(`/hobby/${hobby.id}`).then((res) => {
      expect(res.data).toMatchObject(hobby);
    });
  });

  it("Update hobby", () => {
    return request
      .patch(`/hobby/${hobby.id}`, {
        name: "Gaming",
      })
      .then((res) => {
        expect(res.data.name).toEqual("Gaming");
      });
  });

  it("Get user hobbies", () => {
    return request
      .post<IHobby>("/hobby", {
        name: "Dancing",
        passionLevel: 1,
        year: 2020,
        userId,
      })
      .then(() =>
        request.get<Array<IHobby>>(`/user/${userId}/hobbies`).then((res) => {
          const hobbies = res.data.map((h) => h.name);
          expect(hobbies).toContain("Dancing");
          expect(hobbies).toContain("Gaming");
        })
      );
  });

  it("Delete hobby", () => {
    return request
      .delete(`/hobby/${userId}/${hobby.id}`)
      .then(() =>
        request
          .get(`/hobby/${hobby.id}`)
          .catch((res) => expect(res.response.status).toEqual(404))
      );
  });
});
