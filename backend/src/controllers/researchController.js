var analyzeProduct = require("../services/insightService").analyzeProduct;

function analyze(req, res, next) {
  var productName = req.body.productName;
  var category = req.body.category;
  var location = req.body.location;

  if (!productName || !category || !location) {
    return res.status(400).json({
      message: "productName, category, and location are required"
    });
  }

  return analyzeProduct(req.body)
    .then(function (insight) {
      res.json(insight);
    })
    .catch(function (error) {
      next(error);
    });
}

module.exports = {
  analyze: analyze
};
