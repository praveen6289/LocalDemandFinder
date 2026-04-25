const { getTrendData } = require("../services/trendService");
const { parseBooleanQuery } = require("../utils/request");

async function getTrends(req, res, next) {
  try {
    const { keyword = "", location = "" } = req.query;
    const liveMode = parseBooleanQuery(req.query.liveMode);

    if (!keyword) {
      return res.status(400).json({
        message: "keyword is required"
      });
    }

    const trend = await getTrendData({ keyword, location, liveMode });
    res.json(trend);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTrends
};
