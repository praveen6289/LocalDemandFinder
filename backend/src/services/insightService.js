var env = require("../config/env").env;
var mockObservations = require("../data/mockObservations").mockObservations;
var ProductInsight = require("../models/ProductInsight").ProductInsight;
var ProductObservation = require("../models/ProductObservation").ProductObservation;
var formatterUtils = require("../utils/formatters");
var scoringUtils = require("../utils/scoring");

var average = formatterUtils.average;
var createInsightKey = formatterUtils.createInsightKey;
var toTitleCase = formatterUtils.toTitleCase;
var buildInsightMetrics = scoringUtils.buildInsightMetrics;

var inMemoryObservations = mockObservations.map(function (observation, index) {
  return {
    id: "mock-observation-" + (index + 1),
    productName: observation.productName,
    category: observation.category,
    location: observation.location,
    price: observation.price,
    numberOfSellers: observation.numberOfSellers,
    reviewsCount: observation.reviewsCount,
    searchInterest: observation.searchInterest,
    priceTrend: observation.priceTrend,
    observedAt: observation.observedAt,
    createdAt: observation.observedAt
  };
});

function sanitizeObservation(input) {
  return {
    productName: toTitleCase((input.productName || "").trim()),
    category: toTitleCase((input.category || "").trim()),
    location: toTitleCase((input.location || "").trim()),
    price: Number(input.price),
    numberOfSellers: Number(input.numberOfSellers),
    reviewsCount: Number(input.reviewsCount),
    searchInterest: Number(input.searchInterest),
    priceTrend: Number(input.priceTrend)
  };
}

function derivePriceTrend(baseInput, observations) {
  var categoryMatches = observations.filter(function (observation) {
    return observation.category.toLowerCase() === baseInput.category.toLowerCase() &&
      observation.location.toLowerCase() === baseInput.location.toLowerCase();
  });
  var averagePrice;
  var ratio;
  var trendScore;

  if (!categoryMatches.length) {
    return 60;
  }

  averagePrice = average(categoryMatches.map(function (item) {
    return item.price;
  }));
  ratio = averagePrice === 0 ? 1 : baseInput.price / averagePrice;
  trendScore = 70 - Math.abs(1 - ratio) * 120;

  return Math.max(35, Math.min(90, Math.round(trendScore)));
}

function normalizeLeanObservation(observation) {
  return {
    id: observation._id.toString(),
    _id: observation._id,
    productName: observation.productName,
    category: observation.category,
    location: observation.location,
    price: observation.price,
    numberOfSellers: observation.numberOfSellers,
    reviewsCount: observation.reviewsCount,
    searchInterest: observation.searchInterest,
    priceTrend: observation.priceTrend,
    createdAt: observation.createdAt,
    updatedAt: observation.updatedAt,
    observedAt: observation.observedAt
  };
}

function getObservationSource() {
  if (env.useMockData) {
    return Promise.resolve(inMemoryObservations);
  }

  return ProductObservation.find().sort({ createdAt: -1 }).lean().then(function (observations) {
    return observations.map(function (observation) {
      return normalizeLeanObservation(observation);
    });
  });
}

function getLastTimestamp(observations) {
  var timestamps = observations
    .map(function (item) {
      return item.createdAt || item.observedAt;
    })
    .filter(Boolean)
    .sort();

  if (!timestamps.length) {
    return "";
  }

  return timestamps[timestamps.length - 1];
}

function buildInsightFromGroup(groupKey, observations) {
  var reference = observations[0];
  var averageSellingPrice = average(observations.map(function (item) {
    return item.price;
  }));
  var numberOfSellers = average(observations.map(function (item) {
    return item.numberOfSellers;
  }));
  var reviewsCount = average(observations.map(function (item) {
    return item.reviewsCount;
  }));
  var searchInterest = average(observations.map(function (item) {
    return item.searchInterest;
  }));
  var priceTrend = average(observations.map(function (item) {
    return item.priceTrend || 60;
  }));
  var metrics = buildInsightMetrics({
    averageSellingPrice: averageSellingPrice,
    numberOfSellers: numberOfSellers,
    reviewsCount: reviewsCount,
    searchInterest: searchInterest,
    priceTrend: priceTrend
  });

  return {
    id: groupKey,
    productName: reference.productName,
    category: reference.category,
    location: reference.location,
    totalObservations: observations.length,
    observations: observations,
    lastUpdatedAt: getLastTimestamp(observations),
    demandScore: metrics.demandScore,
    competitionScore: metrics.competitionScore,
    competitionLevel: metrics.competitionLevel,
    averageSellingPrice: metrics.averageSellingPrice,
    suggestedEntryPrice: metrics.suggestedEntryPrice,
    recommendation: metrics.recommendation,
    alert: metrics.alert,
    reviewsScore: metrics.reviewsScore,
    priceTrend: metrics.priceTrend,
    searchInterest: metrics.searchInterest
  };
}

function buildInsights(observations) {
  var groups = {};
  var keys = [];

  observations.forEach(function (observation) {
    var groupKey = createInsightKey(observation);

    if (!groups[groupKey]) {
      groups[groupKey] = [];
      keys.push(groupKey);
    }

    groups[groupKey].push(observation);
  });

  return keys
    .map(function (groupKey) {
      return buildInsightFromGroup(groupKey, groups[groupKey]);
    })
    .sort(function (left, right) {
      return right.demandScore - left.demandScore;
    });
}

function applyInsightFilters(insights, filters) {
  filters = filters || {};

  return insights.filter(function (insight) {
    var matchesLocation = filters.location
      ? insight.location.toLowerCase() === filters.location.toLowerCase()
      : true;
    var matchesCategory = filters.category
      ? insight.category.toLowerCase() === filters.category.toLowerCase()
      : true;

    return matchesLocation && matchesCategory;
  });
}

function getAllInsights(filters) {
  return getObservationSource().then(function (observations) {
    var insights = buildInsights(observations);

    return applyInsightFilters(insights, filters);
  });
}

function getDashboardData(location) {
  return getAllInsights({ location: location }).then(function (insights) {
    var topInsights = insights.slice(0, 6);
    var totals = topInsights.reduce(function (result, insight) {
      result.averageDemand += insight.demandScore;
      result.enterRecommendations += insight.recommendation === "ENTER" ? 1 : 0;
      result.lowCompetition += insight.competitionLevel === "Low" ? 1 : 0;
      result.averagePrice += insight.averageSellingPrice;
      return result;
    }, {
      averageDemand: 0,
      enterRecommendations: 0,
      lowCompetition: 0,
      averagePrice: 0
    });

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
      alerts: insights.filter(function (insight) {
        return insight.alert;
      }).map(function (insight) {
        return {
          id: insight.id,
          message: insight.alert,
          productName: insight.productName,
          location: insight.location
        };
      })
    };
  });
}

function getInsightById(id) {
  return getAllInsights().then(function (insights) {
    var index;

    for (index = 0; index < insights.length; index += 1) {
      if (insights[index].id === id) {
        return insights[index];
      }
    }

    return null;
  });
}

function createObservation(payload) {
  return getObservationSource().then(function (observations) {
    var baseInput = sanitizeObservation(payload);
    var priceTrend = isFinite(baseInput.priceTrend)
      ? baseInput.priceTrend
      : derivePriceTrend(baseInput, observations);
    var normalizedObservation = {
      productName: baseInput.productName,
      category: baseInput.category,
      location: baseInput.location,
      price: baseInput.price,
      numberOfSellers: baseInput.numberOfSellers,
      reviewsCount: baseInput.reviewsCount,
      searchInterest: baseInput.searchInterest,
      priceTrend: priceTrend,
      createdAt: new Date().toISOString()
    };

    if (env.useMockData) {
      var newObservation = {
        id: "mock-observation-" + Date.now(),
        productName: normalizedObservation.productName,
        category: normalizedObservation.category,
        location: normalizedObservation.location,
        price: normalizedObservation.price,
        numberOfSellers: normalizedObservation.numberOfSellers,
        reviewsCount: normalizedObservation.reviewsCount,
        searchInterest: normalizedObservation.searchInterest,
        priceTrend: normalizedObservation.priceTrend,
        createdAt: normalizedObservation.createdAt
      };

      inMemoryObservations.unshift(newObservation);

      return newObservation;
    }

    return ProductObservation.create(normalizedObservation).then(function (createdObservation) {
      var plain = createdObservation.toObject();
      return {
        id: createdObservation._id.toString(),
        _id: plain._id,
        productName: plain.productName,
        category: plain.category,
        location: plain.location,
        price: plain.price,
        numberOfSellers: plain.numberOfSellers,
        reviewsCount: plain.reviewsCount,
        searchInterest: plain.searchInterest,
        priceTrend: plain.priceTrend,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt
      };
    });
  });
}

function getFallbackSignals(payload, insights) {
  var index;
  var categoryMatch;

  for (index = 0; index < insights.length; index += 1) {
    if (
      insights[index].category.toLowerCase() === payload.category.toLowerCase() &&
      insights[index].location.toLowerCase() === payload.location.toLowerCase()
    ) {
      categoryMatch = insights[index];
      break;
    }
  }

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

function analyzeProduct(payload) {
  var cleanedInput = {
    productName: toTitleCase((payload.productName || "").trim()),
    category: toTitleCase((payload.category || "").trim()),
    location: toTitleCase((payload.location || "").trim())
  };

  return getObservationSource().then(function (observations) {
    var matchingObservations = observations.filter(function (observation) {
      return observation.productName.toLowerCase() === cleanedInput.productName.toLowerCase() &&
        observation.category.toLowerCase() === cleanedInput.category.toLowerCase() &&
        observation.location.toLowerCase() === cleanedInput.location.toLowerCase();
    });

    if (matchingObservations.length) {
      return buildInsightFromGroup(createInsightKey(cleanedInput), matchingObservations);
    }

    var existingInsights = buildInsights(observations);
    var fallbackSignals = getFallbackSignals(cleanedInput, existingInsights);
    var metrics = buildInsightMetrics(fallbackSignals);

    return {
      id: createInsightKey(cleanedInput),
      productName: cleanedInput.productName,
      category: cleanedInput.category,
      location: cleanedInput.location,
      totalObservations: 0,
      observations: [],
      lastUpdatedAt: new Date().toISOString(),
      demandScore: metrics.demandScore,
      competitionScore: metrics.competitionScore,
      competitionLevel: metrics.competitionLevel,
      averageSellingPrice: metrics.averageSellingPrice,
      suggestedEntryPrice: metrics.suggestedEntryPrice,
      recommendation: metrics.recommendation,
      alert: metrics.alert,
      reviewsScore: metrics.reviewsScore,
      priceTrend: metrics.priceTrend,
      searchInterest: metrics.searchInterest
    };
  });
}

function persistInsightsToDatabase() {
  return ProductObservation.find().lean()
    .then(function (observations) {
      var normalizedObservations = observations.map(function (observation) {
        return normalizeLeanObservation(observation);
      });
      var insights = buildInsights(normalizedObservations);

      return ProductInsight.deleteMany({}).then(function () {
        if (!insights.length) {
          return 0;
        }

        return ProductInsight.insertMany(insights.map(function (insight) {
          return {
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
          };
        })).then(function () {
          return insights.length;
        });
      });
    });
}

module.exports = {
  getAllInsights: getAllInsights,
  getDashboardData: getDashboardData,
  getInsightById: getInsightById,
  createObservation: createObservation,
  analyzeProduct: analyzeProduct,
  persistInsightsToDatabase: persistInsightsToDatabase
};
