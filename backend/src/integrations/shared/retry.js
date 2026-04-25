const { env } = require("../../config/env");

function wait(delayMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

async function withRetry(task, options = {}) {
  const retries = options.retries ?? env.integrationRetryCount;
  const retryDelayMs = options.retryDelayMs ?? env.integrationRetryDelayMs;
  let attempt = 0;
  let lastError;

  while (attempt <= retries) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      attempt += 1;

      if (attempt > retries) {
        break;
      }

      await wait(retryDelayMs * attempt);
    }
  }

  throw lastError;
}

module.exports = {
  withRetry
};
