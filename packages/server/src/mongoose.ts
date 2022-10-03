import mongoose from "mongoose";

export const connectMongoose = (onOpen: () => void) => {
  mongoose.connection
    .on("error", console.error)
    .on("disconnected", connectMongoose)
    .once("open", onOpen);

  return mongoose
    .connect("mongodb://localhost:27017/livello")
    .catch(console.error);
};
