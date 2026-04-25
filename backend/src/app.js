const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const { env } = require("./config/env");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const dashboardRoutes = require("./routes/dashboardRoutes");
const observationRoutes = require("./routes/observationRoutes");
const productRoutes = require("./routes/productRoutes");
const researchRoutes = require("./routes/researchRoutes");

function createApp() {
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

module.exports = {
  createApp
};
