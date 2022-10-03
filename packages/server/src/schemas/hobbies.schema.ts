import { InferSchemaType, Schema } from "mongoose";

export enum PassionLevel {
  Low,
  Medium,
  High,
  VeryHigh,
}

export const HobbySchema = new Schema({
  name: { type: String, required: true },
  passionLevel: {
    type: Number,
    enum: [
      PassionLevel.Low,
      PassionLevel.Medium,
      PassionLevel.High,
      PassionLevel.VeryHigh,
    ],
    required: true,
  },
  id: { type: String, required: true },
  year: { type: Number, required: true },
});

export type IHobby = InferSchemaType<typeof HobbySchema>;
