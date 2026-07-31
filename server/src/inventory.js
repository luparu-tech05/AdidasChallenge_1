import { AppError } from "./errors.js";

const now = () => new Date().toISOString();

function movementSignature(body) {
  return JSON.stringify({
    productSku: body.productSku,
    type: body.type,
    quantity: body.quantity,
    occurredAt: body.occurredAt || null,
    reference: body.reference || null
  });
}

export function validateMovement(body) {
  const errors = {};
  if (typeof body.productSku !== "string" || !body.productSku.trim()) {
    errors.productSku = "A product SKU is required.";
  }
  if (!["IN", "OUT"].includes(body.type)) {
    errors.type = "Type must be IN or OUT.";
  }
  if (!Number.isInteger(body.quantity) || body.quantity <= 0) {
    errors.quantity = "Quantity must be a positive integer.";
  }
  if (body.occurredAt && Number.isNaN(Date.parse(body.occurredAt))) {
    errors.occurredAt = "occurredAt must be a valid ISO date.";
  }
  if (Object.keys(errors).length) {
    throw new AppError(422, "VALIDATION_ERROR", "Check the request fields.", errors);
  }
}

export function recordMovement(db, store, idempotencyKey, body) {
  validateMovement(body);
  if (!idempotencyKey) {
    throw new AppError(
      400,
      "IDEMPOTENCY_KEY_REQUIRED",
      "Idempotency-Key is required."
    );
  }

  const signature = movementSignature(body);

  return db.transaction(() => {
    const existing = db
      .prepare(
        `SELECT m.*, p.sku AS product_sku
         FROM movements m
         JOIN products p ON p.id = m.product_id
         WHERE m.store_id = ? AND m.idempotency_key = ?`
      )
      .get(store.id, idempotencyKey);

    if (existing) {
      if (existing.request_signature !== signature) {
        throw new AppError(
          409,
          "IDEMPOTENCY_CONFLICT",
          "This idempotency key was already used with different data."
        );
      }
      return {
        movementId: existing.id,
        storeCode: store.code,
        productSku: existing.product_sku,
        type: existing.type,
        quantity: existing.quantity,
        resultingBalance: existing.resulting_balance,
        replayed: true,
        alertOpened: false
      };
    }

    const product = db
      .prepare("SELECT * FROM products WHERE sku = ?")
      .get(body.productSku.trim());
    if (!product) {
      throw new AppError(404, "PRODUCT_NOT_FOUND", "Product SKU was not found.");
    }

    const balance = db
      .prepare(
        "SELECT quantity FROM balances WHERE store_id = ? AND product_id = ?"
      )
      .get(store.id, product.id);
    const currentQuantity = balance?.quantity || 0;
    const delta = body.type === "IN" ? body.quantity : -body.quantity;
    const resultingBalance = currentQuantity + delta;

    if (resultingBalance < 0) {
      throw new AppError(
        409,
        "INSUFFICIENT_STOCK",
        "The movement would make store stock negative.",
        { available: currentQuantity, requested: body.quantity }
      );
    }

    const timestamp = now();
    db.prepare(
      `INSERT INTO balances (store_id, product_id, quantity, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(store_id, product_id)
       DO UPDATE SET quantity = excluded.quantity, updated_at = excluded.updated_at`
    ).run(store.id, product.id, resultingBalance, timestamp);

    const movement = db
      .prepare(
        `INSERT INTO movements (
          store_id, product_id, type, quantity, resulting_balance,
          idempotency_key, request_signature, reference, occurred_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        store.id,
        product.id,
        body.type,
        body.quantity,
        resultingBalance,
        idempotencyKey,
        signature,
        body.reference || null,
        body.occurredAt || timestamp,
        timestamp
      );

    const networkTotal = db
      .prepare(
        "SELECT COALESCE(SUM(quantity), 0) AS total FROM balances WHERE product_id = ?"
      )
      .get(product.id).total;
    const openAlert = db
      .prepare(
        "SELECT id FROM alerts WHERE product_id = ? AND status = 'OPEN'"
      )
      .get(product.id);
    let alertOpened = false;

    if (networkTotal <= product.threshold && !openAlert) {
      db.prepare(
        `INSERT INTO alerts (
          product_id, observed_quantity, threshold, status, opened_at
        ) VALUES (?, ?, ?, 'OPEN', ?)`
      ).run(product.id, networkTotal, product.threshold, timestamp);
      alertOpened = true;
    } else if (networkTotal <= product.threshold && openAlert) {
      db.prepare("UPDATE alerts SET observed_quantity = ? WHERE id = ?").run(
        networkTotal,
        openAlert.id
      );
    } else if (networkTotal > product.threshold && openAlert) {
      db.prepare(
        `UPDATE alerts
         SET status = 'RESOLVED', observed_quantity = ?, resolved_at = ?
         WHERE id = ?`
      ).run(networkTotal, timestamp, openAlert.id);
    }

    return {
      movementId: Number(movement.lastInsertRowid),
      storeCode: store.code,
      productSku: product.sku,
      type: body.type,
      quantity: body.quantity,
      resultingBalance,
      networkTotal,
      replayed: false,
      alertOpened
    };
  })();
}

export function listInventory(db, filters) {
  const clauses = [];
  const values = [];

  if (filters.product) {
    clauses.push("(LOWER(p.sku) LIKE ? OR LOWER(p.name) LIKE ?)");
    const search = `%${filters.product.toLowerCase()}%`;
    values.push(search, search);
  }
  if (filters.store) {
    clauses.push(
      `EXISTS (
        SELECT 1 FROM balances sb
        JOIN stores ss ON ss.id = sb.store_id
        WHERE sb.product_id = p.id AND ss.code = ?
      )`
    );
    values.push(filters.store);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const products = db
    .prepare(
      `SELECT p.*,
        COALESCE(SUM(b.quantity), 0) AS network_total,
        MAX(b.updated_at) AS updated_at
       FROM products p
       LEFT JOIN balances b ON b.product_id = p.id
       ${where}
       GROUP BY p.id
       ORDER BY p.sku`
    )
    .all(...values);

  return products
    .filter(
      (product) =>
        filters.maxStock === undefined ||
        product.network_total <= filters.maxStock
    )
    .map((product) => {
      const storeClause = filters.store ? "AND s.code = ?" : "";
      const storeValues = filters.store
        ? [product.id, filters.store]
        : [product.id];
      const stores = db
        .prepare(
          `SELECT s.code, s.name, b.quantity
           FROM balances b
           JOIN stores s ON s.id = b.store_id
           WHERE b.product_id = ? ${storeClause}
           ORDER BY s.code`
        )
        .all(...storeValues);
      return {
        sku: product.sku,
        name: product.name,
        category: product.category,
        networkTotal: product.network_total,
        threshold: product.threshold,
        status: product.network_total <= product.threshold ? "LOW" : "HEALTHY",
        updatedAt: product.updated_at,
        stores
      };
    });
}

export function getProduct(db, sku) {
  const product = listInventory(db, { product: sku }).find(
    (item) => item.sku === sku
  );
  if (!product) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Product SKU was not found.");
  }

  const movements = db
    .prepare(
      `SELECT m.id, s.code AS storeCode, m.type, m.quantity,
        m.resulting_balance AS resultingBalance, m.reference,
        m.occurred_at AS occurredAt
       FROM movements m
       JOIN products p ON p.id = m.product_id
       JOIN stores s ON s.id = m.store_id
       WHERE p.sku = ?
       ORDER BY m.occurred_at DESC, m.id DESC
       LIMIT 20`
    )
    .all(sku);

  return { ...product, movements };
}
