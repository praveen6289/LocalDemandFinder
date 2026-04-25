const { env } = require("../config/env");
const { ApiResponseCache } = require("../models/ApiResponseCache");

const inMemoryCache = new Map();

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${key}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function buildCacheKey(sourceKey, params) {
  return `${sourceKey}:${stableStringify(params)}`;
}

function getExpiryDate(ttlHours = env.apiCacheTtlHours) {
  return new Date(Date.now() + ttlHours * 60 * 60 * 1000);
}

async function getCachedResponse(sourceKey, params) {
  const cacheKey = buildCacheKey(sourceKey, params);

  if (env.useMockData) {
    const cachedEntry = inMemoryCache.get(cacheKey);

    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
      return cachedEntry.payload;
    }

    return null;
  }

  const cachedRecord = await ApiResponseCache.findOne({
    sourceKey,
    cacheKey,
    expiresAt: { $gt: new Date() }
  }).lean();

  return cachedRecord ? cachedRecord.payload : null;
}

async function setCachedResponse(sourceKey, params, payload, ttlHours = env.apiCacheTtlHours) {
  const cacheKey = buildCacheKey(sourceKey, params);
  const expiresAt = getExpiryDate(ttlHours);

  if (env.useMockData) {
    inMemoryCache.set(cacheKey, {
      payload,
      expiresAt: expiresAt.getTime()
    });

    return payload;
  }

  await ApiResponseCache.findOneAndUpdate(
    { cacheKey },
    {
      sourceKey,
      cacheKey,
      payload,
      expiresAt
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return payload;
}

async function getOrSetCachedResponse(sourceKey, params, fetcher, ttlHours = env.apiCacheTtlHours) {
  const cached = await getCachedResponse(sourceKey, params);

  if (cached) {
    return {
      payload: cached,
      cacheHit: true
    };
  }

  const payload = await fetcher();
  await setCachedResponse(sourceKey, params, payload, ttlHours);

  return {
    payload,
    cacheHit: false
  };
}

module.exports = {
  buildCacheKey,
  getCachedResponse,
  setCachedResponse,
  getOrSetCachedResponse
};
