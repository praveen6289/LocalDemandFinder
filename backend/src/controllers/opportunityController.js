const { analyzeOpportunity } = require("../services/opportunityService");
const { parseBooleanQuery } = require("../utils/request");

async function analyzeOpportunityController(req, res, next) {
  try {
    const { keyword = "", category = "", location = "" } = req.query;
    const liveMode = parseBooleanQuery(req.query.liveMode);

    if (!keyword || !category || !location) {
      return res.status(400).json({
        message: "keyword, category, and location are required"
      });
    }

    const result = await analyzeOpportunity({ keyword, category, location, liveMode });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzeOpportunityController
};
