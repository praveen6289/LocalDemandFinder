const { env } = require("../../config/env");
const { runProviderTask } = require("../shared/providerRunner");
const { getOrSetCachedResponse } = require("../../services/cacheService");

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}

async function requestJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": env.integrationUserAgent
    }
  });

  if (!response.ok) {
    throw new Error(`Instagram Graph API request failed with status ${response.status}`);
  }

  return response.json();
}

function calculateEngagementScore(items) {
  if (!items.length) {
    return 0;
  }

  const total = items.reduce(
    (sum, item) => {
      sum.likes += Number(item.like_count || 0);
      sum.comments += Number(item.comments_count || 0);
      return sum;
    },
    { likes: 0, comments: 0 }
  );

  return clamp((total.likes + total.comments) / items.length);
}

async function getInstagramSignals({ keyword }) {
  if (!env.metaAccessToken || !env.instagramBusinessAccountId) {
    return {
      keyword,
      enabled: false,
      providerType: "disabled",
      source: "instagram-graph-api",
      postsCount: 0,
      engagementScore: 0,
      items: []
    };
  }

  const cacheParams = { keyword };

  return runProviderTask("instagramLive", async () => {
    const { payload, cacheHit } = await getOrSetCachedResponse(
      "instagramLive",
      cacheParams,
      async () => {
        const hashtagLookupUrl = new URL("https://graph.facebook.com/v21.0/ig_hashtag_search");
        hashtagLookupUrl.searchParams.set("user_id", env.instagramBusinessAccountId);
        hashtagLookupUrl.searchParams.set("q", keyword.replace(/^#/, ""));
        hashtagLookupUrl.searchParams.set("access_token", env.metaAccessToken);

        const hashtagLookup = await requestJson(hashtagLookupUrl);
        const hashtagId = hashtagLookup.data?.[0]?.id;

        if (!hashtagId) {
          return {
            keyword,
            enabled: true,
            providerType: "real",
            source: "instagram-graph-api",
            postsCount: 0,
            engagementScore: 0,
            items: []
          };
        }

        const mediaUrl = new URL(`https://graph.facebook.com/v21.0/${hashtagId}/top_media`);
        mediaUrl.searchParams.set("user_id", env.instagramBusinessAccountId);
        mediaUrl.searchParams.set(
          "fields",
          "id,caption,media_type,media_url,permalink,like_count,comments_count,timestamp"
        );
        mediaUrl.searchParams.set("access_token", env.metaAccessToken);

        const mediaResponse = await requestJson(mediaUrl);
        const items = mediaResponse.data || [];

        return {
          keyword,
          enabled: true,
          providerType: "real",
          source: "instagram-graph-api",
          postsCount: items.length,
          engagementScore: calculateEngagementScore(items),
          items
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
  getInstagramSignals
};
