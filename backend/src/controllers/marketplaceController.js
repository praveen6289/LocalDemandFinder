const { searchMarketplaceProducts } = require("../services/marketplaceService");
const { parseBooleanQuery } = require("../utils/request");

async function searchMarketplace(req, res, next) {
  try {
    const { keyword = "", category = "", location = "" } = req.query;
    const liveMode = parseBooleanQuery(req.query.liveMode);
    const marketplaceData = await searchMarketplaceProducts({ keyword, category, location, liveMode });
    res.json(marketplaceData);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  searchMarketplace
};
