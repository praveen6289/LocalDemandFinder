const { getTrendData } = require("./trendService");
const { searchMarketplaceProducts } = require("./marketplaceService");
const { getAveragePrice } = require("./priceService");
const { getSocialSignalData } = require("./socialSignalService");

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}

function getShoppingReviewScore(averageReviewCount, averageRating) {
  const reviewComponent = Math.min(averageReviewCount / 8, 70);
  const ratingComponent = averageRating * 6;
  return clamp(reviewComponent + ratingComponent);
}

function getCompetitionLevel(score) {
  if (score <= 12) {
    return "Low";
  }

  if (score <= 25) {
    return "Medium";
  }

  return "High";
}

function getRecommendation(demandScore, competitionLevel) {
  if (demandScore > 70 && competitionLevel === "Low") {
    return "ENTER";
  }

  if (demandScore > 70 && competitionLevel === "High") {
    return "TEST SMALL QTY";
  }

  if (demandScore >= 40) {
    return "WAIT";
  }

  return "AVOID";
}

function buildReasoningSummary({
  demandScore,
  competitionScore,
  googleSearchInterest,
  youtubeEngagementScore,
  shoppingReviewScore,
  priceStabilityScore,
  partialData
}) {
  const reasons = [];

  reasons.push(`Google search interest contributes ${googleSearchInterest} to the demand picture.`);
  reasons.push(`YouTube engagement score is ${youtubeEngagementScore}.`);
  reasons.push(`Shopping review score is ${shoppingReviewScore} and price stability is ${priceStabilityScore}.`);
  reasons.push(`Competition score is ${competitionScore}.`);

  if (partialData) {
    reasons.push("Partial data was used because one or more live sources were unavailable.");
  }

  if (demandScore > 70) {
    reasons.push("Demand is strong enough to consider stocking quickly.");
  } else if (demandScore >= 40) {
    reasons.push("Demand is moderate, so monitoring and small experiments make sense.");
  } else {
    reasons.push("Demand is weak, so inventory risk is high.");
  }

  return reasons.join(" ");
}

async function analyzeOpportunity({ keyword, category, location, liveMode = false }) {
  const results = await Promise.allSettled([
    getTrendData({ keyword, location, liveMode }),
    searchMarketplaceProducts({ keyword, category, location, liveMode }),
    getAveragePrice({ productName: keyword, category, location, liveMode }),
    getSocialSignalData({ keyword, location, liveMode })
  ]);

  const warnings = [];
  const settledValues = results.map((result) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    warnings.push(result.reason?.message || "Unknown integration error");
    return null;
  });

  const trend = settledValues[0] || {
    keyword,
    location,
    searchInterest: 0,
    trendDirection: "stable",
    relatedQueries: [],
    source: "unavailable",
    providerType: "error"
  };
  const shopping = settledValues[1] || {
    items: [],
    summary: {
      numberOfShoppingResults: 0,
      repeatedSimilarProducts: 0,
      averageRating: 0,
      averageReviewCount: 0
    },
    source: "unavailable",
    providerType: "error",
    warnings: []
  };
  const price = settledValues[2] || {
    averagePrice: 0,
    priceStabilityScore: 0,
    history: [],
    warnings: []
  };
  const social = settledValues[3] || {
    youtube: {
      videoCount: 0,
      topVideos: [],
      totalViewsApprox: 0,
      engagementScore: 0,
      source: "unavailable",
      providerType: "error"
    },
    instagram: {
      enabled: false,
      postsCount: 0,
      engagementScore: 0,
      items: [],
      source: "instagram-graph-api",
      providerType: "disabled"
    },
    warnings: []
  };

  warnings.push(...(trend.warnings || []), ...(shopping.warnings || []), ...(price.warnings || []), ...(social.warnings || []));

  const googleSearchInterest = trend.searchInterest || 0;
  const youtubeEngagementScore = social.youtube?.engagementScore || 0;
  const shoppingReviewScore = getShoppingReviewScore(
    shopping.summary.averageReviewCount || 0,
    shopping.summary.averageRating || 0
  );
  const priceStabilityScore = price.priceStabilityScore || 0;
  const demandScore = clamp(
    googleSearchInterest * 0.45 +
      youtubeEngagementScore * 0.25 +
      shoppingReviewScore * 0.2 +
      priceStabilityScore * 0.1
  );
  const competitionScore =
    (shopping.summary.numberOfShoppingResults || 0) + (shopping.summary.repeatedSimilarProducts || 0);
  const competitionLevel = getCompetitionLevel(competitionScore);
  const recommendation = getRecommendation(demandScore, competitionLevel);
  const partialData = warnings.length > 0;

  return {
    keyword,
    category,
    location,
    liveModeRequested: liveMode,
    modeUsed: partialData ? "partial" : liveMode ? "live" : "mock",
    partialData,
    warnings,
    demandScore,
    competitionScore,
    competitionLevel,
    averagePrice: price.averagePrice || 0,
    googleSearchInterest,
    youtubeEngagementScore,
    shoppingReviewScore,
    priceStabilityScore,
    numberOfShoppingResults: shopping.summary.numberOfShoppingResults || 0,
    repeatedSimilarProducts: shopping.summary.repeatedSimilarProducts || 0,
    recommendation,
    reasoningSummary: buildReasoningSummary({
      demandScore,
      competitionScore,
      googleSearchInterest,
      youtubeEngagementScore,
      shoppingReviewScore,
      priceStabilityScore,
      partialData
    }),
    sources: {
      googleTrends: trend,
      youtube: social.youtube,
      shopping: {
        items: shopping.items,
        summary: shopping.summary,
        source: shopping.source,
        providerType: shopping.providerType,
        modeUsed: shopping.modeUsed
      },
      instagram: social.instagram,
      price
    }
  };
}

module.exports = {
  analyzeOpportunity
};
