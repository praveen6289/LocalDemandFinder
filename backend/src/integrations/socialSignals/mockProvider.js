const { runProviderTask } = require("../shared/providerRunner");

const socialSeed = {
  "reusable lunch bag": { views: 240000, postsCount: 420, engagementScore: 78 },
  "organic jaggery cubes": { views: 198000, postsCount: 305, engagementScore: 74 },
  "copper water bottle": { views: 175000, postsCount: 210, engagementScore: 59 },
  "bluetooth speaker": { views: 420000, postsCount: 580, engagementScore: 71 },
  "yoga resistance band": { views: 260000, postsCount: 360, engagementScore: 67 },
  "led strip light": { views: 315000, postsCount: 402, engagementScore: 69 }
};

async function getSocialSignals({ keyword }) {
  return runProviderTask("socialSignals", async (metadata) => {
    const normalizedKeyword = (keyword || "").trim().toLowerCase();
    const seed = socialSeed[normalizedKeyword] || {
      views: 120000,
      postsCount: 190,
      engagementScore: 56
    };

    return {
      source: "social-signals-mock",
      providerType: "mock",
      keyword,
      views: seed.views,
      postsCount: seed.postsCount,
      engagementScore: seed.engagementScore,
      requestMeta: metadata
    };
  });
}

module.exports = {
  getSocialSignals
};
