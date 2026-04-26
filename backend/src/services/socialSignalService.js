const liveYoutubeClient = require("../integrations/youtube/youtubeClient");
const liveInstagramClient = require("../integrations/instagram/instagramClient");
const mockSocialSignalsIntegration = require("../integrations/socialSignals");
const { env } = require("../config/env");

async function getSocialSignalData({ keyword, location = "", liveMode = false }) {
  const warnings = [];

  let youtube = null;
  let instagram = null;

  if (liveMode && env.hasYoutubeApi) {
    try {
      youtube = await liveYoutubeClient.getYoutubeSignals({ keyword, location });
    } catch (error) {
      warnings.push(`YouTube live data unavailable: ${error.message}`);
    }
  } else if (liveMode && !env.hasYoutubeApi) {
    warnings.push("YouTube live data unavailable: missing YOUTUBE_API_KEY");
  }

  if (liveMode && env.hasInstagramApi) {
    try {
      instagram = await liveInstagramClient.getInstagramSignals({ keyword });
    } catch (error) {
      warnings.push(`Instagram live data unavailable: ${error.message}`);
    }
  }

  if (!youtube) {
    const fallback = await mockSocialSignalsIntegration.getSocialSignals({ keyword });
    youtube = {
      keyword,
      location,
      videoCount: fallback.postsCount,
      topVideos: [],
      totalViewsApprox: fallback.views,
      engagementScore: fallback.engagementScore,
      providerType: "mock",
      source: fallback.source,
      modeUsed: "mock",
      liveProviderConfigured: env.hasYoutubeApi
    };
  }

  if (!instagram) {
    instagram = {
      keyword,
      enabled: false,
      providerType: "disabled",
      source: "instagram-graph-api",
      postsCount: 0,
      engagementScore: 0,
      items: [],
      liveProviderConfigured: env.hasInstagramApi
    };
  }

  return {
    youtube,
    instagram,
    warnings
  };
}

module.exports = {
  getSocialSignalData
};
