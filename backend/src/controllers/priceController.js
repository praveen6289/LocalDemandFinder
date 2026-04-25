const { getAveragePrice } = require("../services/priceService");
const { parseBooleanQuery } = require("../utils/request");

async function getAveragePriceController(req, res, next) {
  try {
    const { productName = "", category = "", location = "" } = req.query;
    const liveMode = parseBooleanQuery(req.query.liveMode);

    if (!productName || !category) {
      return res.status(400).json({
        message: "productName and category are required"
      });
    }

    const averagePrice = await getAveragePrice({ productName, category, location, liveMode });
    res.json(averagePrice);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAveragePriceController
};
