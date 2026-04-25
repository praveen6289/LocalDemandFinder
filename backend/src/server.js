const { createApp } = require("./app");
const { connectDatabase } = require("./config/database");
const { env } = require("./config/env");
const { startDailyRefreshScheduler } = require("./schedulers/dataRefreshScheduler");

async function startServer() {
  await connectDatabase();

  const app = createApp();

  startDailyRefreshScheduler();

  app.listen(env.port, () => {
    console.log(`Local Demand Finder API listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
