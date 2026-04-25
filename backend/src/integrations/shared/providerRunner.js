const { env } = require("../../config/env");
const { withRetry } = require("./retry");
const { withRateLimit } = require("./rateLimiter");

async function runProviderTask(providerKey, executor, options = {}) {
  const metadata = {
    userAgent: env.integrationUserAgent,
    providerKey,
    mode: env.useMockData ? "mock" : "live"
  };

  return withRateLimit(providerKey, () =>
    withRetry(() => executor(metadata), options)
  );
}

module.exports = {
  runProviderTask
};
