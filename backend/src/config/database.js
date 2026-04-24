import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (env.useMockData) {
    console.log("Using mock data mode. MongoDB connection skipped.");
    return;
  }

  await mongoose.connect(env.mongoUri);
  console.log("Connected to MongoDB.");
}

