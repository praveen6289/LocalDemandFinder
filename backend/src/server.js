import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

async function startServer() {
  await connectDatabase();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Local Demand Finder API listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

