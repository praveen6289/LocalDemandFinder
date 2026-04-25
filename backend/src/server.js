var createApp = require("./app").createApp;
var connectDatabase = require("./config/database").connectDatabase;
var env = require("./config/env").env;

function startServer() {
  return connectDatabase().then(function () {
    var app = createApp();

    app.listen(env.port, function () {
      console.log("Local Demand Finder API listening on port " + env.port);
    });
  });
}

startServer().catch(function (error) {
  console.error("Failed to start server", error);
  process.exit(1);
});
