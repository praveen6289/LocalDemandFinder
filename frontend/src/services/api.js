const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let message = "Request failed";

    try {
      const errorPayload = await response.json();
      message = errorPayload.message || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return response.json();
}

export function getDashboard(location) {
  const query = location ? `?location=${encodeURIComponent(location)}` : "";
  return request(`/dashboard${query}`);
}

export function createObservation(payload) {
  return request("/observations", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function analyzeProduct(payload) {
  return request("/analysis/analyze", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getProductDetails(id) {
  return request(`/products/${id}`);
}

export function getIntegrationStatus() {
  return request("/integrations/status");
}

export function refreshIntegrationStatus(liveMode = false) {
  const query = new URLSearchParams({
    liveMode: String(liveMode)
  });

  return request(`/integrations/refresh?${query.toString()}`, {
    method: "POST"
  });
}

export function getTrendIntegration(payload) {
  const query = new URLSearchParams({
    keyword: payload.keyword,
    location: payload.location || "",
    liveMode: String(Boolean(payload.liveMode))
  });

  return request(`/integrations/trends?${query.toString()}`);
}

export function getYoutubeIntegration(payload) {
  const query = new URLSearchParams({
    keyword: payload.keyword,
    location: payload.location || "",
    liveMode: String(Boolean(payload.liveMode))
  });

  return request(`/integrations/youtube?${query.toString()}`);
}

export function getShoppingIntegration(payload) {
  const query = new URLSearchParams({
    keyword: payload.keyword,
    category: payload.category || "",
    location: payload.location || "",
    liveMode: String(Boolean(payload.liveMode))
  });

  return request(`/integrations/shopping?${query.toString()}`);
}

export function analyzeOpportunity(payload) {
  const query = new URLSearchParams({
    keyword: payload.keyword,
    category: payload.category,
    location: payload.location,
    liveMode: String(Boolean(payload.liveMode))
  });

  return request(`/opportunity/analyze?${query.toString()}`);
}
