import axios from "axios";
import mongoose from "mongoose";

export const request = axios.create({
  baseURL: "http://localhost:5000",
});

export const connectDB = async () => {
  try {
    const uri = "mongodb://localhost:27017";
    const name = "livello";
    await mongoose.connect(uri, {
      dbName: name,
      autoCreate: true,
    });
  } catch (error) {
    console.log("DB connect error");
  }
};
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.log("DB disconnect error");
  }
};
