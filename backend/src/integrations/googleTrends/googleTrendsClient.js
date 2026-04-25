const googleTrends = require("google-trends-api");
const { env } = require("../../config/env");
const { runProviderTask } = require("../shared/providerRunner");
const { getOrSetCachedResponse } = require("../../services/cacheService");

const locationCodeMap = {
  india: "IN",
  pune: "IN-MH",
  mumbai: "IN-MH",
  bengaluru: "IN-KA",
  bangalore: "IN-KA",
  delhi: "IN-DL",
  hyderabad: "IN-TG",
  chennai: "IN-TN",
  jaipur: "IN-RJ",
  usa: "US",
  "united states": "US"
};

function normalizeLocationToGeo(location) {
  if (!location) {
    return "";
  }

  return locationCodeMap[location.trim().toLowerCase()] || "";
}

function getTrendDirection(timelineData) {
  if (timelineData.length < 2) {
    return "stable";
  }

  const midpoint = Math.max(1, Math.floor(timelineData.length / 2));
  const firstAverage =
    timelineData.slice(0, midpoint).reduce((sum, item) => sum + item.value[0], 0) / midpoint;
  const secondHalf = timelineData.slice(midpoint);
  const secondAverage =
    secondHalf.reduce((sum, item) => sum + item.value[0], 0) / secondHalf.length;

  if (secondAverage - firstAverage > 5) {
    return "up";
  }

  if (firstAverage - secondAverage > 5) {
    return "down";
  }

  return "stable";
}

function extractRelatedQueries(relatedQueryPayload) {
  const rankedKeywords =
    relatedQueryPayload?.default?.rankedList?.flatMap((group) => group.rankedKeyword || []) || [];

  return rankedKeywords
    .slice(0, 5)
    .map((item) => item.query)
    .filter(Boolean);
}

async function fetchFromConfiguredApi(keyword, location) {
  if (!env.googleTrendsApiKey || !env.googleTrendsApiUrl) {
    return null;
  }

  const requestUrl = new URL(env.googleTrendsApiUrl);
  requestUrl.searchParams.set("keyword", keyword);
  requestUrl.searchParams.set("location", location || "");
  requestUrl.searchParams.set("key", env.googleTrendsApiKey);

  const response = await fetch(requestUrl, {
    headers: {
      "User-Agent": env.integrationUserAgent
    }
  });

  if (!response.ok) {
    throw new Error(`Google Trends API request failed with status ${response.status}`);
  }

  return response.json();
}

async function fetchFromGoogleTrendsApiPackage(keyword, location) {
  const geo = normalizeLocationToGeo(location);
  const trendPayload = JSON.parse(
    await googleTrends.interestOverTime({
      keyword,
      geo: geo || undefined
    })
  );
  const relatedQueryPayload = JSON.parse(
    await googleTrends.relatedQueries({
      keyword,
      geo: geo || undefined
    })
  );
  const timelineData = trendPayload.default.timelineData || [];
  const recentPoints = timelineData.slice(-7);
  const searchInterest = recentPoints.length
    ? Math.round(
        recentPoints.reduce((sum, item) => sum + item.value[0], 0) / recentPoints.length
      )
    : 0;

  return {
    keyword,
    location,
    searchInterest,
    trendDirection: getTrendDirection(timelineData),
    relatedQueries: extractRelatedQueries(relatedQueryPayload),
    providerType: "real",
    source: "google-trends-api-package"
  };
}

async function getTrendData({ keyword, location }) {
  const cacheParams = {
    keyword,
    location
  };

  return runProviderTask("googleTrendsLive", async () => {
    const { payload, cacheHit } = await getOrSetCachedResponse(
      "googleTrendsLive",
      cacheParams,
      async () => {
        const configuredResponse = await fetchFromConfiguredApi(keyword, location);

        if (configuredResponse) {
          return {
            keyword,
            location,
            searchInterest: configuredResponse.searchInterest || 0,
            trendDirection: configuredResponse.trendDirection || "stable",
            relatedQueries: configuredResponse.relatedQueries || [],
            providerType: "real",
            source: "google-trends-api-configured"
          };
        }

        return fetchFromGoogleTrendsApiPackage(keyword, location);
      }
    );

    return {
      ...payload,
      cacheHit
    };
  });
}

module.exports = {
  getTrendData
};
