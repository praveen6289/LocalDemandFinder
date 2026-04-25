const { runProviderTask } = require("../shared/providerRunner");

const trendSeed = {
  "reusable lunch bag": { Pune: 88, Mumbai: 76, Bengaluru: 81 },
  "organic jaggery cubes": { Bengaluru: 91, Hyderabad: 74, Chennai: 69 },
  "copper water bottle": { Mumbai: 72, Delhi: 66, Pune: 63 },
  "bluetooth speaker": { Delhi: 83, Mumbai: 79, Bengaluru: 75 },
  "yoga resistance band": { Hyderabad: 66, Bengaluru: 64, Pune: 58 },
  "led strip light": { Chennai: 74, Delhi: 70, Mumbai: 68 }
};

async function getTrendScore({ keyword, location }) {
  return runProviderTask("googleTrends", async (metadata) => {
    const normalizedKeyword = (keyword || "").trim().toLowerCase();
    const normalizedLocation = (location || "").trim();
    const locationSeed = trendSeed[normalizedKeyword] || {};
    const seededScore = locationSeed[normalizedLocation] ?? 58;
    const variation = normalizedKeyword.length % 7;
    const score = Math.max(20, Math.min(100, seededScore + variation));

    return {
      source: "google-trends-mock",
      providerType: "mock",
      keyword,
      location,
      searchInterest: score,
      requestMeta: metadata
    };
  });
}

module.exports = {
  getTrendScore
};
