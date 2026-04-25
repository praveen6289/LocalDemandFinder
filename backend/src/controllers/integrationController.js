const {
  getIntegrationStatus,
  refreshIntegrations
} = require("../services/integrationStatusService");
const { getTrendData } = require("../services/trendService");
const { getSocialSignalData } = require("../services/socialSignalService");
const { searchMarketplaceProducts } = require("../services/marketplaceService");
const { parseBooleanQuery } = require("../utils/request");

async function getStatus(req, res, next) {
  try {
    const status = await getIntegrationStatus();
    res.json(status);
  } catch (error) {
    next(error);
  }
}

async function refreshStatus(req, res, next) {
  try {
    const liveMode = parseBooleanQuery(req.query.liveMode || req.body?.liveMode);
    const result = await refreshIntegrations(liveMode);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getTrendIntegration(req, res, next) {
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

async function getYoutubeIntegration(req, res, next) {
  try {
    const { keyword = "", location = "" } = req.query;
    const liveMode = parseBooleanQuery(req.query.liveMode);

    if (!keyword) {
      return res.status(400).json({
        message: "keyword is required"
      });
    }

    const social = await getSocialSignalData({ keyword, location, liveMode });
    res.json({
      keyword,
      location,
      partialData: social.warnings.length > 0,
      warnings: social.warnings,
      videoCount: social.youtube.videoCount,
      topVideos: social.youtube.topVideos,
      totalViewsApprox: social.youtube.totalViewsApprox,
      engagementScore: social.youtube.engagementScore,
      modeUsed: social.youtube.modeUsed || social.youtube.providerType,
      source: social.youtube.source,
      youtube: social.youtube,
      instagram: social.instagram
    });
  } catch (error) {
    next(error);
  }
}

async function getShoppingIntegration(req, res, next) {
  try {
    const { keyword = "", category = "", location = "" } = req.query;
    const liveMode = parseBooleanQuery(req.query.liveMode);

    if (!keyword) {
      return res.status(400).json({
        message: "keyword is required"
      });
    }

    const shopping = await searchMarketplaceProducts({ keyword, category, location, liveMode });
    res.json({
      productName: keyword,
      location,
      items: shopping.items,
      summary: shopping.summary,
      modeUsed: shopping.modeUsed,
      warnings: shopping.warnings
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStatus,
  refreshStatus,
  getTrendIntegration,
  getYoutubeIntegration,
  getShoppingIntegration
};
