const { env } = require("../config/env");
const { mockObservations } = require("../data/mockObservations");
const { ProductInsight } = require("../models/ProductInsight");
const { ProductObservation } = require("../models/ProductObservation");
const { average, createInsightKey, toTitleCase } = require("../utils/formatters");
const { buildInsightMetrics } = require("../utils/scoring");

const inMemoryObservations = mockObservations.map((observation, index) => ({
  id: `mock-observation-${index + 1}`,
  ...observation,
  createdAt: observation.observedAt
}));

function sanitizeObservation(input) {
  return {
    productName: toTitleCase(input.productName?.trim()),
    category: toTitleCase(input.category?.trim()),
    location: toTitleCase(input.location?.trim()),
    price: Number(input.price),
    numberOfSellers: Number(input.numberOfSellers),
    reviewsCount: Number(input.reviewsCount),
    searchInterest: Number(input.searchInterest),
    priceTrend: Number(input.priceTrend)
  };
}

function derivePriceTrend({ price, category, location }, observations) {
  const categoryMatches = observations.filter(
    (observation) =>
      observation.category.toLowerCase() === category.toLowerCase() &&
      observation.location.toLowerCase() === location.toLowerCase()
  );

  if (!categoryMatches.length) {
    return 60;
  }

  const averagePrice = average(categoryMatches.map((item) => item.price));
  const ratio = averagePrice === 0 ? 1 : price / averagePrice;
  const trendScore = 70 - Math.abs(1 - ratio) * 120;

  return Math.max(35, Math.min(90, Math.round(trendScore)));
}

async function getObservationSource() {
  if (env.useMockData) {
    return inMemoryObservations;
  }

  const observations = await ProductObservation.find().sort({ createdAt: -1 }).lean();

  return observations.map((observation) => ({
    id: observation._id.toString(),
    ...observation
  }));
}

function buildInsightFromGroup(groupKey, observations) {
  const reference = observations[0];
  const averageSellingPrice = average(observations.map((item) => item.price));
  const numberOfSellers = average(observations.map((item) => item.numberOfSellers));
  const reviewsCount = average(observations.map((item) => item.reviewsCount));
  const searchInterest = average(observations.map((item) => item.searchInterest));
  const priceTrend = average(observations.map((item) => item.priceTrend || 60));
  const metrics = buildInsightMetrics({
    averageSellingPrice,
    numberOfSellers,
    reviewsCount,
    searchInterest,
    priceTrend
  });

  return {
    id: groupKey,
    productName: reference.productName,
    category: reference.category,
    location: reference.location,
    totalObservations: observations.length,
    observations,
    lastUpdatedAt: observations
      .map((item) => item.createdAt || item.observedAt)
      .sort()
      .at(-1),
    ...metrics
  };
}

function buildInsights(observations) {
  const groups = observations.reduce((collection, observation) => {
    const groupKey = createInsightKey(observation);

    if (!collection.has(groupKey)) {
      collection.set(groupKey, []);
    }

    collection.get(groupKey).push(observation);
    return collection;
  }, new Map());

  return [...groups.entries()]
    .map(([groupKey, groupObservations]) => buildInsightFromGroup(groupKey, groupObservations))
    .sort((left, right) => right.demandScore - left.demandScore);
}

function applyInsightFilters(insights, filters = {}) {
  return insights.filter((insight) => {
    const matchesLocation = filters.location
      ? insight.location.toLowerCase() === filters.location.toLowerCase()
      : true;
    const matchesCategory = filters.category
      ? insight.category.toLowerCase() === filters.category.toLowerCase()
      : true;

    return matchesLocation && matchesCategory;
  });
}

async function getAllInsights(filters = {}) {
  const observations = await getObservationSource();
  const insights = buildInsights(observations);

  return applyInsightFilters(insights, filters);
}

async function getDashboardData(location) {
  const insights = await getAllInsights({ location });
  const topInsights = insights.slice(0, 6);

  const totals = topInsights.reduce(
    (result, insight) => {
      result.averageDemand += insight.demandScore;
      result.enterRecommendations += insight.recommendation === "ENTER" ? 1 : 0;
      result.lowCompetition += insight.competitionLevel === "Low" ? 1 : 0;
      result.averagePrice += insight.averageSellingPrice;
      return result;
    },
    {
      averageDemand: 0,
      enterRecommendations: 0,
      lowCompetition: 0,
      averagePrice: 0
    }
  );

  return {
    highlights: {
      trackedProducts: insights.length,
      averageDemandScore: topInsights.length
        ? Math.round(totals.averageDemand / topInsights.length)
        : 0,
      lowCompetitionMarkets: totals.lowCompetition,
      averageSellingPrice: topInsights.length
        ? Math.round(totals.averagePrice / topInsights.length)
        : 0,
      enterRecommendations: totals.enterRecommendations
    },
    trendingProducts: topInsights,
    alerts: insights.filter((insight) => insight.alert).map((insight) => ({
      id: insight.id,
      message: insight.alert,
      productName: insight.productName,
      location: insight.location
    }))
  };
}

async function getInsightById(id) {
  const insights = await getAllInsights();
  return insights.find((insight) => insight.id === id) || null;
}

async function createObservation(payload) {
  const observations = await getObservationSource();
  const baseInput = sanitizeObservation(payload);
  const priceTrend = Number.isFinite(baseInput.priceTrend)
    ? baseInput.priceTrend
    : derivePriceTrend(baseInput, observations);

  const normalizedObservation = {
    ...baseInput,
    priceTrend,
    createdAt: new Date().toISOString()
  };

  if (env.useMockData) {
    const newObservation = {
      id: `mock-observation-${Date.now()}`,
      ...normalizedObservation
    };

    inMemoryObservations.unshift(newObservation);

    return newObservation;
  }

  const createdObservation = await ProductObservation.create(normalizedObservation);

  return {
    id: createdObservation._id.toString(),
    ...createdObservation.toObject()
  };
}

function getFallbackSignals(payload, insights) {
  const categoryMatch = insights.find(
    (insight) =>
      insight.category.toLowerCase() === payload.category.toLowerCase() &&
      insight.location.toLowerCase() === payload.location.toLowerCase()
  );

  if (categoryMatch) {
    return {
      averageSellingPrice: categoryMatch.averageSellingPrice,
      numberOfSellers: categoryMatch.competitionScore,
      reviewsCount: categoryMatch.reviewsScore * 10,
      searchInterest: Math.max(categoryMatch.searchInterest - 4, 35),
      priceTrend: categoryMatch.priceTrend
    };
  }

  return {
    averageSellingPrice: 499,
    numberOfSellers: 18,
    reviewsCount: 320,
    searchInterest: 55,
    priceTrend: 58
  };
}

async function analyzeProduct(payload) {
  const cleanedInput = {
    productName: toTitleCase(payload.productName?.trim()),
    category: toTitleCase(payload.category?.trim()),
    location: toTitleCase(payload.location?.trim())
  };
  const observations = await getObservationSource();
  const matchingObservations = observations.filter(
    (observation) =>
      observation.productName.toLowerCase() === cleanedInput.productName.toLowerCase() &&
      observation.category.toLowerCase() === cleanedInput.category.toLowerCase() &&
      observation.location.toLowerCase() === cleanedInput.location.toLowerCase()
  );

  if (matchingObservations.length) {
    return buildInsightFromGroup(createInsightKey(cleanedInput), matchingObservations);
  }

  const existingInsights = buildInsights(observations);
  const fallbackSignals = getFallbackSignals(cleanedInput, existingInsights);
  const metrics = buildInsightMetrics(fallbackSignals);

  return {
    id: createInsightKey(cleanedInput),
    ...cleanedInput,
    totalObservations: 0,
    observations: [],
    lastUpdatedAt: new Date().toISOString(),
    ...metrics
  };
}

async function persistInsightsToDatabase() {
  const observations = await ProductObservation.find().lean();
  const normalizedObservations = observations.map((observation) => ({
    id: observation._id.toString(),
    ...observation
  }));
  const insights = buildInsights(normalizedObservations);

  await ProductInsight.deleteMany({});

  if (!insights.length) {
    return 0;
  }

  await ProductInsight.insertMany(
    insights.map((insight) => ({
      insightKey: insight.id,
      productName: insight.productName,
      category: insight.category,
      location: insight.location,
      demandScore: insight.demandScore,
      competitionScore: insight.competitionScore,
      competitionLevel: insight.competitionLevel,
      averageSellingPrice: insight.averageSellingPrice,
      suggestedEntryPrice: insight.suggestedEntryPrice,
      recommendation: insight.recommendation,
      priceTrend: insight.priceTrend,
      reviewsScore: insight.reviewsScore,
      searchInterest: insight.searchInterest,
      totalObservations: insight.totalObservations,
      alert: insight.alert
    }))
  );

  return insights.length;
}

module.exports = {
  getAllInsights,
  getDashboardData,
  getInsightById,
  createObservation,
  analyzeProduct,
  persistInsightsToDatabase
};
