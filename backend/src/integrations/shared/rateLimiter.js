const { env } = require("../../config/env");

const lastCallMap = new Map();

function wait(delayMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

async function withRateLimit(key, task, minimumDelayMs = env.integrationRateLimitMs) {
  const now = Date.now();
  const lastCallAt = lastCallMap.get(key) || 0;
  const waitTime = minimumDelayMs - (now - lastCallAt);

  if (waitTime > 0) {
    await wait(waitTime);
  }

  lastCallMap.set(key, Date.now());
  return task();
}

module.exports = {
  withRateLimit
};
