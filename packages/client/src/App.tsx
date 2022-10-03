import React from "react";
import axios from "axios";

const request = axios.create({
  baseURL: "http://localhost:5000",
});
type User = {
  name: string;
  hobbies: string[];
  id: string;
};
const PassionLevels = ["low", "medium", "high", "very-high"] as const;
type Hobby = {
  name: string;
  passionLevel: typeof PassionLevels[number];
  year: string;
  id: string;
};

function App() {
  const [username, setUsername] = React.useState("");
  const [err, setErr] = React.useState("");
  const [users, setUsers] = React.useState<User[]>([]);
  const [userId, setUserId] = React.useState("");
  const initHobby = React.useRef<Hobby>({
    name: "",
    passionLevel: "" as "low",
    year: "",
    id: "",
  }).current;
  const [hobby, setHobby] = React.useState<Hobby>(initHobby);
  const [hobbies, setHobbies] = React.useState<Array<Hobby>>([]);

  const getUsers = React.useCallback(() => {
    setErr("...loading");
    request
      .get("/users")
      .then((res) => {
        setUsers(res.data);
        setErr("");
      })
      .catch((error) => setErr(error.response.message));
  }, []);
  React.useEffect(() => {
    getUsers();
  }, [getUsers]);

  const getUserHobbies = React.useCallback(() => {
    setErr("...loading");
    request
      .get(`/user/${userId}/hobbies`)
      .then((res) => {
        setHobbies(res.data);
        setErr("");
      })
      .catch((error) => setErr(error.response.message));
  }, [userId]);

  React.useEffect(() => {
    if (userId) {
      getUserHobbies();
    }
  }, [userId, getUserHobbies]);

  const deleteHobby = (id: string) => {
    setErr("...loading");
    if (!id) return setErr("No hobby id or user id");
    if (!userId) return setErr("Please select user");
    request
      .delete(`/hobby/${userId}/${id}`)
      .then(() => {
        setErr("");
        getUserHobbies();
      })
      .catch((error) => setErr(error.response.message));
  };

  const numberToPassionLevel = (passionLevel: number) => {
    if (typeof passionLevel === "string") return passionLevel;
    switch (passionLevel) {
      case 0:
        return "low";
      case 1:
        return "medium";
      case 2:
        return "high";
      case 3:
        return "very-high";
    }
  };
  const passionLevelToNumber = (passionLevel: Hobby["passionLevel"]) => {
    console.log(passionLevel);
    switch (passionLevel) {
      case "low":
        return 0;
      case "medium":
        return 1;
      case "high":
        return 2;
      case "very-high":
        return 3;
    }
  };
  const addHobby = () => {
    setErr("...loading");
    if (!hobby.name) return setErr("Enter hobby name");
    if (!hobby.passionLevel || !PassionLevels.includes(hobby.passionLevel))
      return setErr(
        "Enter valid hobby passion level (low, medium, high, very-high)"
      );
    if (!hobby.year || !Number.isSafeInteger(parseInt(hobby.year, 10)))
      return setErr("Enter valid hobby year");
    if (!userId) return setErr("Please select user");

    request
      .post("/hobby", {
        name: hobby.name,
        passionLevel: passionLevelToNumber(hobby.passionLevel),
        year: parseInt(hobby.year, 10),
        userId,
      })
      .then(() => {
        setHobby(initHobby);
        setErr("");
        getUserHobbies();
      })
      .catch((error) => setErr(error.response.message));
  };

  const addUser = () => {
    setErr("...loading");
    if (!username) return setErr("Enter username");
    request
      .post("/user", {
        name: username,
        hobbies: [],
      })
      .then(() => {
        setUsername("");
        setErr("");
        getUsers();
      })
      .catch((error) => setErr(error.response.message));
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: 10 }}>
        <span>
          <b>User Hobbies</b>
        </span>
      </div>
      <div style={{ flexDirection: "row", display: "flex" }}>
        <div style={{ border: "1px solid grey", padding: 10, flex: 0.3 }}>
          <div
            style={{ display: "flex", flexDirection: "row", margin: "5px 0px" }}
          >
            <input
              placeholder="Enter name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button onClick={addUser}>Add</button>
          </div>
          <div>
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => setUserId(user.id)}
                style={{
                  padding: 5,
                  border: "1px solid black",
                  borderColor: userId === user.id ? "blue" : "black",
                  borderWidth: userId === user.id ? 2 : 1,
                  textAlign: "center",
                }}
              >
                <span>{user.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ border: "1px solid grey", padding: 10, flex: 1 }}>
          <input
            placeholder="Enter passion level"
            value={hobby.passionLevel}
            onChange={(e) => {
              setHobby((prev) => ({
                ...prev,
                passionLevel: e.target.value as "low",
              }));
            }}
          />
          <input
            placeholder="Enter hobby"
            value={hobby.name}
            onChange={(e) => {
              setHobby((prev) => ({ ...prev, name: e.target.value }));
            }}
          />
          <input
            placeholder="Enter year"
            value={hobby.year}
            onChange={(e) => {
              setHobby((prev) => ({
                ...prev,
                year: e.target.value,
              }));
            }}
          />
          <button onClick={addHobby}>Add</button>
          <div>
            <div>
              {hobbies.map((_hobby) => (
                <div
                  key={_hobby.id}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{ flex: 1, border: "1px solid black", padding: 5 }}
                  >
                    {numberToPassionLevel(
                      _hobby.passionLevel as unknown as number
                    )}
                  </span>
                  <span
                    style={{ flex: 1, border: "1px solid black", padding: 5 }}
                  >
                    {_hobby.name}
                  </span>
                  <span
                    style={{ flex: 1, border: "1px solid black", padding: 5 }}
                  >
                    {_hobby.year}
                  </span>
                  <button
                    onClick={() => deleteHobby(_hobby.id)}
                    style={{
                      color: "red",
                      flex: 1,
                      border: "1px solid black",
                      padding: 5,
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: 10 }}>
        <span style={{ color: "red" }}>
          <b>{err}</b>
        </span>
      </div>
    </div>
  );
}

export default App;
