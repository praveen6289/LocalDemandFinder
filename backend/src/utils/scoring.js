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
  var adjustmentMap = {
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

function calculateDemandScore(input) {
  var normalizedReviews = normalizeReviews(input.reviewsCount);
  var demandScore =
    input.searchInterest * 0.5 +
    normalizedReviews * 0.3 +
    input.priceTrend * 0.2;

  return {
    demandScore: clampScore(demandScore),
    reviewsScore: normalizedReviews
  };
}

function buildInsightMetrics(input) {
  var averageSellingPrice = round(input.averageSellingPrice);
  var competitionScore = round(input.numberOfSellers);
  var competitionLevel = getCompetitionLevel(competitionScore);
  var demandResult = calculateDemandScore({
    searchInterest: input.searchInterest,
    reviewsCount: input.reviewsCount,
    priceTrend: input.priceTrend
  });
  var demandScore = demandResult.demandScore;
  var reviewsScore = demandResult.reviewsScore;
  var suggestedEntryPrice = getSuggestedEntryPrice(averageSellingPrice, competitionLevel);
  var recommendation = getRecommendation(demandScore, competitionLevel);
  var alert = buildAlert(demandScore, competitionLevel);

  return {
    demandScore: demandScore,
    competitionScore: competitionScore,
    competitionLevel: competitionLevel,
    averageSellingPrice: averageSellingPrice,
    suggestedEntryPrice: suggestedEntryPrice,
    recommendation: recommendation,
    alert: alert,
    reviewsScore: reviewsScore,
    priceTrend: clampScore(input.priceTrend),
    searchInterest: clampScore(input.searchInterest)
  };
}

module.exports = {
  clampScore: clampScore,
  normalizeReviews: normalizeReviews,
  getCompetitionLevel: getCompetitionLevel,
  getSuggestedEntryPrice: getSuggestedEntryPrice,
  getRecommendation: getRecommendation,
  buildAlert: buildAlert,
  calculateDemandScore: calculateDemandScore,
  buildInsightMetrics: buildInsightMetrics
};
