var mongoose = require("mongoose");
var env = require("../config/env").env;
var mockObservations = require("../data/mockObservations").mockObservations;
var ProductObservation = require("../models/ProductObservation").ProductObservation;
var persistInsightsToDatabase = require("../services/insightService").persistInsightsToDatabase;

function seed() {
  return mongoose.connect(env.mongoUri)
    .then(function () {
      return ProductObservation.deleteMany({});
    })
    .then(function () {
      return ProductObservation.insertMany(mockObservations);
    })
    .then(function () {
      return persistInsightsToDatabase();
    })
    .then(function (insightCount) {
      console.log("Seeded " + mockObservations.length + " observations and " + insightCount + " product insights.");
      return mongoose.disconnect();
    });
}

seed().catch(function (error) {
  console.error("Seed failed", error);
  process.exit(1);
});
