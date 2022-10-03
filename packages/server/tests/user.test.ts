import { User } from "../src/models/user.model";
import { IUser } from "../src/schemas/user.schema";
import { connectDB, disconnectDB, request } from "./setup";

describe("User Endpoint Tests", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await User.collection.drop();
    await disconnectDB();
  });

  it("Get all users", () => {
    return request
      .get("/users")
      .then((users) => expect(users.data).toEqual([]));
  });

  let user: IUser;
  it("Create user", () => {
    return request
      .post<IUser>("/user", {
        name: "Famous",
        hobbies: [],
      })
      .then((res) => {
        expect(res.data.name).toEqual("Famous");
        user = res.data;
      });
  });

  it("Read user", () => {
    return request.get(`/user/${user.id}`).then((res) => {
      expect(res.data).toMatchObject(user);
    });
  });

  it("Update user", () => {
    return request
      .patch(`/user/${user.id}`, {
        name: "John",
      })
      .then((res) => {
        expect(res.data.name).toEqual("John");
      });
  });
  it("Get user hobbies", () => {
    return request.get(`/user/${user.id}/hobbies`).then((res) => {
      expect(res.data).toEqual([]);
    });
  });
  it("Shouldn't update user id", () => {
    return request
      .patch(`/user/${user.id}`, {
        name: "Paul",
        id: "6339f7ja50f48770d8b1c08e",
      })
      .then((res) => {
        expect(res.data.id).toEqual(user.id);
        expect(res.data.name).toEqual("Paul");
      });
  });
  it("Should return 404", () => {
    return request.get(`/user/6339f7fa50f48770d8b1c08e`).catch((err) => {
      expect(err.response.status).toEqual(404);
    });
  });

  it("Delete user", () => {
    return request
      .delete(`/user/${user.id}`)
      .then(() =>
        request
          .get(`/user/${user.id}`)
          .catch((res) => expect(res.response.status).toEqual(404))
      );
  });
});
