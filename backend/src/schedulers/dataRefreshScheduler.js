const { env } = require("../config/env");
const { refreshIntegrations } = require("../services/integrationStatusService");

let refreshTimer = null;

function getRefreshIntervalMs() {
  return env.refreshIntervalHours * 60 * 60 * 1000;
}

function startDailyRefreshScheduler() {
  if (refreshTimer) {
    return;
  }

  const shouldUseLiveMode = Boolean(
    env.youtubeApiKey ||
      env.serpapiKey ||
      (env.metaAccessToken && env.instagramBusinessAccountId) ||
      env.googleTrendsApiKey ||
      env.googleTrendsApiUrl
  );

  refreshIntegrations(shouldUseLiveMode).catch((error) => {
    console.error("Initial integration refresh failed.", error);
  });

  refreshTimer = setInterval(async () => {
    try {
      await refreshIntegrations(shouldUseLiveMode);
      console.log("Daily integration refresh completed.");
    } catch (error) {
      console.error("Daily integration refresh failed.", error);
    }
  }, getRefreshIntervalMs());

  if (typeof refreshTimer.unref === "function") {
    refreshTimer.unref();
  }
}

module.exports = {
  startDailyRefreshScheduler
};
