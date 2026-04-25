const { analyzeProduct } = require("../services/insightService");

async function analyze(req, res, next) {
  try {
    const { productName, category, location } = req.body;

    if (!productName || !category || !location) {
      return res.status(400).json({
        message: "productName, category, and location are required"
      });
    }

    const insight = await analyzeProduct(req.body);
    res.json(insight);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyze
};
