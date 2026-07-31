async function apiRequest(path, options) {
  const response = await fetch(path, options);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error?.message || "The API request failed.");
  }
  return body.data;
}

export function getInventory(filters = {}) {
  const query = new URLSearchParams();
  if (filters.product) query.set("product", filters.product);
  if (filters.store) query.set("store", filters.store);
  if (filters.maxStock !== "") query.set("maxStock", filters.maxStock);
  return apiRequest(`/api/inventory?${query}`);
}

export function getProduct(sku) {
  return apiRequest(`/api/inventory/${encodeURIComponent(sku)}`);
}

export function getAlerts(status = "OPEN") {
  return apiRequest(`/api/alerts?status=${status}`);
}

export function getStores() {
  return apiRequest("/api/stores");
}

export function postMovement({ apiKey, idempotencyKey, ...movement }) {
  return apiRequest("/api/movements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "Idempotency-Key": idempotencyKey
    },
    body: JSON.stringify(movement)
  });
}
