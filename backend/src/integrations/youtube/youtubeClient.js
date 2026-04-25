const { env } = require("../../config/env");
const { runProviderTask } = require("../shared/providerRunner");
const { getOrSetCachedResponse } = require("../../services/cacheService");

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}

function buildKeywordQuery(keyword, location) {
  return [keyword, location].filter(Boolean).join(" ").trim();
}

function buildTopVideos(videoItems) {
  return videoItems.map((item) => ({
    id: item.id,
    title: item.snippet?.title || "",
    channelTitle: item.snippet?.channelTitle || "",
    publishedAt: item.snippet?.publishedAt || "",
    views: Number(item.statistics?.viewCount || 0),
    likes: Number(item.statistics?.likeCount || 0),
    comments: Number(item.statistics?.commentCount || 0),
    thumbnail:
      item.snippet?.thumbnails?.high?.url ||
      item.snippet?.thumbnails?.medium?.url ||
      item.snippet?.thumbnails?.default?.url ||
      ""
  }));
}

function calculateEngagementScore(videoItems) {
  if (!videoItems.length) {
    return 0;
  }

  const aggregate = videoItems.reduce(
    (sum, item) => {
      sum.views += Number(item.statistics?.viewCount || 0);
      sum.likes += Number(item.statistics?.likeCount || 0);
      sum.comments += Number(item.statistics?.commentCount || 0);
      return sum;
    },
    { views: 0, likes: 0, comments: 0 }
  );

  const engagementRate =
    aggregate.views > 0 ? ((aggregate.likes + aggregate.comments) / aggregate.views) * 100 : 0;
  return clamp(engagementRate * 10);
}

async function requestJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": env.integrationUserAgent
    }
  });

  if (!response.ok) {
    throw new Error(`YouTube API request failed with status ${response.status}`);
  }

  return response.json();
}

async function getYoutubeSignals({ keyword, location }) {
  if (!env.youtubeApiKey) {
    throw new Error("Missing YOUTUBE_API_KEY");
  }

  const query = buildKeywordQuery(keyword, location);
  const cacheParams = { keyword, location };

  return runProviderTask("youtubeLive", async () => {
    const { payload, cacheHit } = await getOrSetCachedResponse(
      "youtubeLive",
      cacheParams,
      async () => {
        const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
        searchUrl.searchParams.set("part", "snippet");
        searchUrl.searchParams.set("type", "video");
        searchUrl.searchParams.set("maxResults", "5");
        searchUrl.searchParams.set("order", "viewCount");
        searchUrl.searchParams.set("q", query);
        searchUrl.searchParams.set("key", env.youtubeApiKey);

        const searchResponse = await requestJson(searchUrl);
        const videoIds = (searchResponse.items || [])
          .map((item) => item.id?.videoId)
          .filter(Boolean);

        if (!videoIds.length) {
          return {
            keyword,
            location,
            videoCount: 0,
            topVideos: [],
            totalViewsApprox: 0,
            engagementScore: 0,
            providerType: "real",
            source: "youtube-data-api"
          };
        }

        const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
        videosUrl.searchParams.set("part", "snippet,statistics");
        videosUrl.searchParams.set("id", videoIds.join(","));
        videosUrl.searchParams.set("key", env.youtubeApiKey);

        const videoResponse = await requestJson(videosUrl);
        const topVideos = buildTopVideos(videoResponse.items || []);
        const totalViewsApprox = topVideos.reduce((sum, item) => sum + item.views, 0);

        return {
          keyword,
          location,
          videoCount: Number(searchResponse.pageInfo?.totalResults || topVideos.length),
          topVideos,
          totalViewsApprox,
          engagementScore: calculateEngagementScore(videoResponse.items || []),
          providerType: "real",
          source: "youtube-data-api"
        };
      }
    );

    return {
      ...payload,
      cacheHit
    };
  });
}

module.exports = {
  getYoutubeSignals
};
