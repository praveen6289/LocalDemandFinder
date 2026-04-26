const liveShoppingClient = require("../integrations/serpapi/serpapiClient");
const mockMarketplaceIntegration = require("../integrations/marketplace");
const { env } = require("../config/env");

function round(value) {
  return Math.round(value * 10) / 10;
}

function normalizeMockItems(items) {
  return items.map((item) => ({
    productName: item.productName,
    source: item.marketplaceName,
    price: item.price,
    rating: item.rating,
    reviews: item.reviewCount,
    link: "",
    thumbnail: ""
  }));
}

function buildSummary(items) {
  const totalReviews = items.reduce((sum, item) => sum + Number(item.reviews || 0), 0);
  const totalRatings = items.reduce((sum, item) => sum + Number(item.rating || 0), 0);

  return {
    numberOfShoppingResults: items.length,
    repeatedSimilarProducts: getRepeatedSimilarProducts(items),
    averageRating: items.length ? round(totalRatings / items.length) : 0,
    averageReviewCount: items.length ? Math.round(totalReviews / items.length) : 0
  };
}

function getRepeatedSimilarProducts(items) {
  const counts = new Map();

  items.forEach((item) => {
    const key = item.productName.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return [...counts.values()].reduce((sum, count) => sum + Math.max(0, count - 1), 0);
}

async function searchMarketplaceProducts({ keyword, category = "", location = "", liveMode = false }) {
  const warnings = [];

  if (liveMode && env.hasSerpapi) {
    try {
      const liveResult = await liveShoppingClient.getShoppingResultsData({ keyword, location });
      return {
        ...liveResult,
        items: liveResult.results,
        summary: buildSummary(liveResult.results),
        modeUsed: "live",
        warnings
      };
    } catch (error) {
      warnings.push(`Google Shopping live data unavailable: ${error.message}`);
    }
  }

  const fallback = await mockMarketplaceIntegration.searchMarketplace({ keyword, category, location });
  const items = normalizeMockItems(fallback.items);

  return {
    keyword,
    category,
    location,
    items,
    providerType: "mock",
    source: fallback.source,
    modeUsed: "mock",
    summary: buildSummary(items),
    liveProviderConfigured: env.hasSerpapi,
    warnings
  };
}

module.exports = {
  searchMarketplaceProducts
};
