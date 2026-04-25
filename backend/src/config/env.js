const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/local-demand-finder",
  useMockData: process.env.USE_MOCK_DATA !== "false",
  integrationUserAgent: process.env.INTEGRATION_USER_AGENT || "LocalDemandFinderBot/1.0 (+mock-mode)",
  integrationRetryCount: Number(process.env.INTEGRATION_RETRY_COUNT || 2),
  integrationRetryDelayMs: Number(process.env.INTEGRATION_RETRY_DELAY_MS || 250),
  integrationRateLimitMs: Number(process.env.INTEGRATION_RATE_LIMIT_MS || 150),
  refreshIntervalHours: Number(process.env.REFRESH_INTERVAL_HOURS || 24),
  apiCacheTtlHours: Number(process.env.API_CACHE_TTL_HOURS || 24),
  googleTrendsApiKey: process.env.GOOGLE_TRENDS_API_KEY || "",
  googleTrendsApiUrl: process.env.GOOGLE_TRENDS_API_URL || "",
  youtubeApiKey: process.env.YOUTUBE_API_KEY || "",
  serpapiKey: process.env.SERPAPI_KEY || "",
  metaAccessToken: process.env.META_ACCESS_TOKEN || "",
  instagramBusinessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || ""
};

module.exports = {
  env
};
