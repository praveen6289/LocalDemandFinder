const mongoose = require("mongoose");
const { env } = require("../config/env");
const { mockObservations } = require("../data/mockObservations");
const { ProductObservation } = require("../models/ProductObservation");
const { persistInsightsToDatabase } = require("../services/insightService");

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
