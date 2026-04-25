const liveYoutubeClient = require("../integrations/youtube/youtubeClient");
const liveInstagramClient = require("../integrations/instagram/instagramClient");
const mockSocialSignalsIntegration = require("../integrations/socialSignals");

async function getSocialSignalData({ keyword, location = "", liveMode = false }) {
  const warnings = [];

  let youtube = null;
  let instagram = null;

  if (liveMode) {
    try {
      youtube = await liveYoutubeClient.getYoutubeSignals({ keyword, location });
    } catch (error) {
      warnings.push(`YouTube live data unavailable: ${error.message}`);
    }

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
      modeUsed: "mock"
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
      items: []
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
