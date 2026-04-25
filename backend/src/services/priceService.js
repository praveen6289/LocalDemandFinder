const { PriceSnapshot } = require("../models/PriceSnapshot");
const { env } = require("../config/env");
const priceTrackerIntegration = require("../integrations/priceTracker");
const { searchMarketplaceProducts } = require("./marketplaceService");

function getSnapshotDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

async function buildAveragePriceData({ productName, category, location = "", liveMode = false }) {
  const marketplaceResult = await searchMarketplaceProducts({
    keyword: productName,
    category,
    location,
    liveMode
  });
  const priceSnapshot = await priceTrackerIntegration.buildPriceSnapshot(marketplaceResult.items, {
    keyword: productName,
    category,
    location
  });

  return {
    productName,
    category,
    location,
    averagePrice: priceSnapshot.averagePrice,
    minPrice: priceSnapshot.minPrice,
    maxPrice: priceSnapshot.maxPrice,
    priceSpread: priceSnapshot.priceSpread,
    priceStabilityScore: priceSnapshot.priceStabilityScore,
    sampleSize: marketplaceResult.items.length,
    marketplaceItems: marketplaceResult.items,
    modeUsed: marketplaceResult.modeUsed,
    warnings: marketplaceResult.warnings || []
  };
}

async function storeDailyPriceSnapshots({ keyword, category = "", location = "", liveMode = false } = {}) {
  const marketplaceResult = await searchMarketplaceProducts({ keyword, category, location, liveMode });
  const snapshotDate = getSnapshotDate();

  if (!marketplaceResult.items.length || env.useMockData) {
    return {
      snapshotDate,
      storedCount: env.useMockData ? marketplaceResult.items.length : 0,
      skippedPersistence: env.useMockData
    };
  }

  await PriceSnapshot.deleteMany({
    keyword,
    category,
    snapshotDate
  });

  await PriceSnapshot.insertMany(
    marketplaceResult.items.map((item) => ({
      productName: item.productName,
      keyword,
      category,
      location,
      marketplaceName: item.source,
      price: item.price,
      snapshotDate
    }))
  );

  return {
    snapshotDate,
    storedCount: marketplaceResult.items.length,
    skippedPersistence: false
  };
}

async function getAveragePrice({ productName, category, location = "", liveMode = false }) {
  const priceData = await buildAveragePriceData({ productName, category, location, liveMode });
  let history = [];

  if (!env.useMockData) {
    history = await PriceSnapshot.find({
      keyword: productName,
      category
    })
      .sort({ snapshotDate: -1, createdAt: -1 })
      .limit(7)
      .lean();
  }

  return {
    ...priceData,
    history
  };
}

module.exports = {
  getAveragePrice,
  storeDailyPriceSnapshots,
  getSnapshotDate
};
