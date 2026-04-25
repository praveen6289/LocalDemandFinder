const mongoose = require("mongoose");
const { env } = require("./env");

async function connectDatabase() {
  if (env.useMockData) {
    console.log("Using mock data mode. MongoDB connection skipped.");
    return;
  }

  await mongoose.connect(env.mongoUri);
  console.log("Connected to MongoDB.");
}

module.exports = {
  connectDatabase
};
