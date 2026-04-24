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

