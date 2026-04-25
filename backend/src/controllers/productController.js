var insightService = require("../services/insightService");

function getProducts(req, res, next) {
  insightService
    .getAllInsights({
      location: req.query.location,
      category: req.query.category
    })
    .then(function (products) {
      res.json(products);
    })
    .catch(function (error) {
      next(error);
    });
}

function getProductById(req, res, next) {
  insightService
    .getInsightById(req.params.id)
    .then(function (product) {
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      return res.json(product);
    })
    .catch(function (error) {
      next(error);
    });
}

module.exports = {
  getProducts: getProducts,
  getProductById: getProductById
};
