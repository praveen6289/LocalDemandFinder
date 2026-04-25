const { env } = require("../config/env");
const { IntegrationSync } = require("../models/IntegrationSync");
const { getTrendData } = require("./trendService");
const { searchMarketplaceProducts } = require("./marketplaceService");
const { getSocialSignalData } = require("./socialSignalService");
const { storeDailyPriceSnapshots } = require("./priceService");

const sourceDefinitions = [
  {
    sourceKey: "googleTrends",
    sourceName: "Google Trends",
    envKey: "GOOGLE_TRENDS_API_KEY",
    optional: false
  },
  {
    sourceKey: "youtube",
    sourceName: "YouTube Data API",
    envKey: "YOUTUBE_API_KEY",
    optional: false
  },
  {
    sourceKey: "shopping",
    sourceName: "Google Shopping via SerpApi",
    envKey: "SERPAPI_KEY",
    optional: false
  },
  {
    sourceKey: "instagram",
    sourceName: "Instagram Graph API",
    envKey: "META_ACCESS_TOKEN",
    optional: true
  }
];

const inMemorySyncState = new Map(
  sourceDefinitions.map((source) => [
    source.sourceKey,
    {
      ...source,
      status: "warning",
      providerType: "mock",
      message: "Live API not configured. Mock fallback available.",
      lastSyncAt: null,
      lastSuccessAt: null,
      itemsProcessed: 0
    }
  ])
);

function getProviderStatus(sourceKey) {
  if (sourceKey === "googleTrends") {
    return env.googleTrendsApiKey && env.googleTrendsApiUrl ? "configured" : "package-fallback";
  }

  if (sourceKey === "youtube") {
    return env.youtubeApiKey ? "configured" : "fallback";
  }

  if (sourceKey === "shopping") {
    return env.serpapiKey ? "configured" : "fallback";
  }

  if (sourceKey === "instagram") {
    return env.metaAccessToken && env.instagramBusinessAccountId ? "configured" : "optional";
  }

  return "fallback";
}

async function saveSyncState(payload) {
  if (env.useMockData) {
    inMemorySyncState.set(payload.sourceKey, payload);
    return payload;
  }

  await IntegrationSync.findOneAndUpdate(
    { sourceKey: payload.sourceKey },
    payload,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return payload;
}

async function getSyncStates() {
  if (env.useMockData) {
    return sourceDefinitions.map((definition) => {
      const current = inMemorySyncState.get(definition.sourceKey);
      return {
        ...current,
        configurationState: getProviderStatus(definition.sourceKey)
      };
    });
  }

  const records = await IntegrationSync.find().lean();
  const recordMap = new Map(records.map((record) => [record.sourceKey, record]));

  return sourceDefinitions.map((source) => ({
    ...source,
    status: recordMap.get(source.sourceKey)?.status || "warning",
    providerType: recordMap.get(source.sourceKey)?.providerType || "mock",
    message:
      recordMap.get(source.sourceKey)?.message ||
      "Live API not configured. Mock fallback available.",
    lastSyncAt: recordMap.get(source.sourceKey)?.lastSyncAt || null,
    lastSuccessAt: recordMap.get(source.sourceKey)?.lastSuccessAt || null,
    itemsProcessed: recordMap.get(source.sourceKey)?.itemsProcessed || 0,
    configurationState: getProviderStatus(source.sourceKey)
  }));
}

async function refreshIntegrations(liveMode = false) {
  const now = new Date();
  const tasks = [
    async () => {
      const trend = await getTrendData({
        keyword: "Reusable Lunch Bag",
        location: "Pune",
        liveMode
      });
      await saveSyncState({
        sourceKey: "googleTrends",
        sourceName: "Google Trends",
        status: trend.modeUsed === "live" ? "connected" : "warning",
        providerType: trend.modeUsed,
        message:
          trend.modeUsed === "live"
            ? "Live Google Trends data connected"
            : "Fallback to mock Google Trends data",
        lastSyncAt: now,
        lastSuccessAt: now,
        itemsProcessed: trend.relatedQueries.length || 1
      });
      return trend;
    },
    async () => {
      const youtube = await getSocialSignalData({
        keyword: "Reusable Lunch Bag",
        location: "Pune",
        liveMode
      });
      await saveSyncState({
        sourceKey: "youtube",
        sourceName: "YouTube Data API",
        status: youtube.youtube.modeUsed === "live" ? "connected" : "warning",
        providerType: youtube.youtube.modeUsed || youtube.youtube.providerType,
        message:
          youtube.youtube.modeUsed === "live"
            ? "Live YouTube data connected"
            : "Fallback to mock YouTube social signals",
        lastSyncAt: now,
        lastSuccessAt: now,
        itemsProcessed: youtube.youtube.topVideos?.length || youtube.youtube.videoCount || 0
      });

      await saveSyncState({
        sourceKey: "instagram",
        sourceName: "Instagram Graph API",
        status: youtube.instagram.enabled ? "connected" : youtube.instagram.providerType === "disabled" ? "warning" : "error",
        providerType: youtube.instagram.providerType,
        message: youtube.instagram.enabled
          ? "Instagram hashtag search connected"
          : "Instagram credentials missing or optional integration disabled",
        lastSyncAt: now,
        lastSuccessAt: youtube.instagram.enabled ? now : null,
        itemsProcessed: youtube.instagram.postsCount || 0
      });

      return youtube;
    },
    async () => {
      const shopping = await searchMarketplaceProducts({
        keyword: "Reusable Lunch Bag",
        category: "Kitchen",
        location: "Pune",
        liveMode
      });
      await saveSyncState({
        sourceKey: "shopping",
        sourceName: "Google Shopping via SerpApi",
        status: shopping.modeUsed === "live" ? "connected" : "warning",
        providerType: shopping.modeUsed,
        message:
          shopping.modeUsed === "live"
            ? "Live Google Shopping data connected"
            : "Fallback to mock shopping data",
        lastSyncAt: now,
        lastSuccessAt: now,
        itemsProcessed: shopping.items.length
      });
      return shopping;
    },
    async () => {
      return storeDailyPriceSnapshots({
        keyword: "Reusable Lunch Bag",
        category: "Kitchen",
        location: "Pune",
        liveMode
      });
    }
  ];

  const results = [];

  for (const task of tasks) {
    try {
      results.push(await task());
    } catch (error) {
      console.error("Integration refresh failed", error);
    }
  }

  return {
    refreshedAt: now.toISOString(),
    liveModeRequested: liveMode,
    status: await getSyncStates(),
    results
  };
}

async function getIntegrationStatus() {
  const status = await getSyncStates();
  const lastSyncTime =
    status
      .map((item) => item.lastSyncAt)
      .filter(Boolean)
      .sort()
      .at(-1) || null;

  return {
    mode: env.useMockData ? "mock" : "database",
    liveConfigured: {
      googleTrends: ["configured", "package-fallback"].includes(getProviderStatus("googleTrends")),
      youtube: getProviderStatus("youtube") === "configured",
      shopping: getProviderStatus("shopping") === "configured",
      instagram: getProviderStatus("instagram") === "configured"
    },
    lastSyncTime,
    integrations: status
  };
}

module.exports = {
  getIntegrationStatus,
  refreshIntegrations
};
