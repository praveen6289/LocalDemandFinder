function round(value) {
  return Math.round(value * 10) / 10;
}

function clampScore(value) {
  return Math.max(0, Math.min(100, round(value)));
}

function normalizeReviews(reviewsCount) {
  return clampScore(reviewsCount / 10);
}

function getCompetitionLevel(numberOfSellers) {
  if (numberOfSellers <= 15) {
    return "Low";
  }

  if (numberOfSellers <= 35) {
    return "Medium";
  }

  return "High";
}

function getSuggestedEntryPrice(averageSellingPrice, competitionLevel) {
  const adjustmentMap = {
    Low: 0.97,
    Medium: 0.94,
    High: 0.9
  };

  return round(averageSellingPrice * adjustmentMap[competitionLevel]);
}

function getRecommendation(demandScore, competitionLevel) {
  if (demandScore > 70 && competitionLevel === "Low") {
    return "ENTER";
  }

  if (demandScore < 40 || competitionLevel === "High") {
    return "AVOID";
  }

  return "WAIT";
}

function buildAlert(demandScore, competitionLevel) {
  if (demandScore > 70 && competitionLevel === "Low") {
    return "Good opportunity detected";
  }

  return "";
}

function calculateDemandScore({ searchInterest, reviewsCount, priceTrend }) {
  const normalizedReviews = normalizeReviews(reviewsCount);
  const demandScore =
    searchInterest * 0.5 +
    normalizedReviews * 0.3 +
    priceTrend * 0.2;

  return {
    demandScore: clampScore(demandScore),
    reviewsScore: normalizedReviews
  };
}

function buildInsightMetrics(input) {
  const averageSellingPrice = round(input.averageSellingPrice);
  const competitionScore = round(input.numberOfSellers);
  const competitionLevel = getCompetitionLevel(competitionScore);
  const { demandScore, reviewsScore } = calculateDemandScore({
    searchInterest: input.searchInterest,
    reviewsCount: input.reviewsCount,
    priceTrend: input.priceTrend
  });
  const suggestedEntryPrice = getSuggestedEntryPrice(averageSellingPrice, competitionLevel);
  const recommendation = getRecommendation(demandScore, competitionLevel);
  const alert = buildAlert(demandScore, competitionLevel);

  return {
    demandScore,
    competitionScore,
    competitionLevel,
    averageSellingPrice,
    suggestedEntryPrice,
    recommendation,
    alert,
    reviewsScore,
    priceTrend: clampScore(input.priceTrend),
    searchInterest: clampScore(input.searchInterest)
  };
}

module.exports = {
  clampScore,
  normalizeReviews,
  getCompetitionLevel,
  getSuggestedEntryPrice,
  getRecommendation,
  buildAlert,
  calculateDemandScore,
  buildInsightMetrics
};
