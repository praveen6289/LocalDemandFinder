const liveTrendsClient = require("../integrations/googleTrends/googleTrendsClient");
const mockTrendsClient = require("../integrations/googleTrends");

async function getTrendData({ keyword, location, liveMode = false }) {
  const warnings = [];

  if (liveMode) {
    try {
      const liveResult = await liveTrendsClient.getTrendData({ keyword, location });
      return {
        ...liveResult,
        modeUsed: "live",
        warnings
      };
    } catch (error) {
      warnings.push(`Google Trends live data unavailable: ${error.message}`);
    }
  }

  const fallback = await mockTrendsClient.getTrendScore({ keyword, location });

  return {
    keyword,
    location,
    searchInterest: fallback.searchInterest,
    trendDirection: "stable",
    relatedQueries: [],
    providerType: "mock",
    source: fallback.source,
    modeUsed: "mock",
    warnings
  };
}

module.exports = {
  getTrendData
};
