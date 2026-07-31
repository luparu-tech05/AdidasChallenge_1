import { timingSafeEqual } from "node:crypto";
import { hashKey } from "../database.js";
import { AppError } from "../errors.js";

function sameHash(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function storeAuthentication(db) {
  return (request, _response, next) => {
    const apiKey = request.get("X-API-Key");
    if (!apiKey) {
      return next(new AppError(401, "API_KEY_REQUIRED", "X-API-Key is required."));
    }

    const candidate = hashKey(apiKey);
    const stores = db
      .prepare("SELECT id, code, name, api_key_hash, active FROM stores")
      .all();
    const store = stores.find((item) => sameHash(candidate, item.api_key_hash));

    if (!store) {
      return next(new AppError(401, "INVALID_API_KEY", "The API key is invalid."));
    }
    if (!store.active) {
      return next(new AppError(403, "STORE_INACTIVE", "The store is inactive."));
    }

    request.store = { id: store.id, code: store.code, name: store.name };
    next();
  };
}

export function adminAuthentication(request, _response, next) {
  const received = request.get("X-Admin-Key");
  const expected = process.env.ADMIN_KEY || "admin-demo-key";
  if (!received || received !== expected) {
    return next(new AppError(401, "INVALID_ADMIN_KEY", "Admin key is invalid."));
  }
  next();
}
