const { runProviderTask } = require("../shared/providerRunner");

async function buildPriceSnapshot(items, { keyword, category, location }) {
  return runProviderTask("priceTracker", async (metadata) => {
    const prices = items.map((item) => item.price);
    const averagePrice = prices.length
      ? Math.round(prices.reduce((sum, value) => sum + value, 0) / prices.length)
      : 0;
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const priceSpread = maxPrice - minPrice;
    const priceStabilityScore = prices.length
      ? Math.max(25, Math.min(100, 100 - Math.round((priceSpread / Math.max(maxPrice, 1)) * 100)))
      : 45;

    return {
      source: "price-tracker-mock",
      providerType: "mock",
      keyword,
      category,
      location,
      averagePrice,
      minPrice,
      maxPrice,
      priceSpread,
      priceStabilityScore,
      requestMeta: metadata
    };
  });
}

module.exports = {
  buildPriceSnapshot
};
