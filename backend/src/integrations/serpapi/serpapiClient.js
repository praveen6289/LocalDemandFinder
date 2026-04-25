const { env } = require("../../config/env");
const { runProviderTask } = require("../shared/providerRunner");
const { getOrSetCachedResponse } = require("../../services/cacheService");

function normalizeShoppingResult(item) {
  return {
    productName: item.title || "",
    source: item.source || "",
    price: item.extracted_price || 0,
    rating: item.rating || 0,
    reviews: item.reviews || 0,
    link: item.link || item.serpapi_link || "",
    thumbnail: item.thumbnail || ""
  };
}

function getShoppingResults(data) {
  const candidates = data.shopping_results || data.inline_shopping_results || [];
  return candidates.map(normalizeShoppingResult);
}

async function getShoppingResultsData({ keyword, location }) {
  if (!env.serpapiKey) {
    throw new Error("Missing SERPAPI_KEY");
  }

  const cacheParams = { keyword, location };

  return runProviderTask("serpapiShopping", async () => {
    const { payload, cacheHit } = await getOrSetCachedResponse(
      "serpapiShopping",
      cacheParams,
      async () => {
        const requestUrl = new URL("https://serpapi.com/search.json");
        requestUrl.searchParams.set("engine", "google_shopping");
        requestUrl.searchParams.set("q", keyword);
        requestUrl.searchParams.set("location", location || "");
        requestUrl.searchParams.set("api_key", env.serpapiKey);
        requestUrl.searchParams.set("no_cache", "false");

        const response = await fetch(requestUrl, {
          headers: {
            "User-Agent": env.integrationUserAgent
          }
        });

        if (!response.ok) {
          throw new Error(`SerpApi request failed with status ${response.status}`);
        }

        const data = await response.json();

        return {
          keyword,
          location,
          results: getShoppingResults(data),
          providerType: "real",
          source: "serpapi-google-shopping"
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
  getShoppingResultsData
};
