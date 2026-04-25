function notFoundHandler(req, res) {
  res.status(404).json({
    message: "Route not found: " + req.originalUrl
  });
}

function errorHandler(error, req, res, next) {
  console.error(error);

  res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error"
  });
}

module.exports = {
  notFoundHandler: notFoundHandler,
  errorHandler: errorHandler
};
