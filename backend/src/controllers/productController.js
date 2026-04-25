const { getAllInsights, getInsightById } = require("../services/insightService");

async function getProducts(req, res, next) {
  try {
    const products = await getAllInsights({
      location: req.query.location,
      category: req.query.category
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await getInsightById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductById
};
