var cors = require("cors");
var express = require("express");
var morgan = require("morgan");
var env = require("./config/env").env;
var errorMiddleware = require("./middleware/errorHandler");
var dashboardRoutes = require("./routes/dashboardRoutes");
var observationRoutes = require("./routes/observationRoutes");
var productRoutes = require("./routes/productRoutes");
var researchRoutes = require("./routes/researchRoutes");

function createApp() {
  var app = express();

  app.use(cors({
    origin: env.clientUrl
  }));
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/api/health", function (req, res) {
    res.json({
      status: "ok",
      mode: env.useMockData ? "mock" : "database"
    });
  });

  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/observations", observationRoutes);
  app.use("/api/analysis", researchRoutes);

  app.use(errorMiddleware.notFoundHandler);
  app.use(errorMiddleware.errorHandler);

  return app;
}

module.exports = {
  createApp: createApp
};
