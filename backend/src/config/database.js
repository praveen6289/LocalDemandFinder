var mongoose = require("mongoose");
var env = require("./env").env;

function connectDatabase() {
  if (env.useMockData) {
    console.log("Using mock data mode. MongoDB connection skipped.");
    return Promise.resolve();
  }

  return mongoose.connect(env.mongoUri).then(function () {
    console.log("Connected to MongoDB.");
  });
}

module.exports = {
  connectDatabase: connectDatabase
};
