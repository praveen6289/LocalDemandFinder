import mongoose from "mongoose";
import { env } from "../config/env.js";
import { mockObservations } from "../data/mockObservations.js";
import { ProductObservation } from "../models/ProductObservation.js";
import { persistInsightsToDatabase } from "../services/insightService.js";

async function seed() {
  await mongoose.connect(env.mongoUri);

  await ProductObservation.deleteMany({});
  await ProductObservation.insertMany(
    mockObservations.map((observation) => ({
      ...observation
    }))
  );

  const insightCount = await persistInsightsToDatabase();

  console.log(`Seeded ${mockObservations.length} observations and ${insightCount} product insights.`);

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
