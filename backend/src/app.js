import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import observationRoutes from "./routes/observationRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import researchRoutes from "./routes/researchRoutes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl
    })
  );
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      mode: env.useMockData ? "mock" : "database"
    });
  });

  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/observations", observationRoutes);
  app.use("/api/analysis", researchRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

