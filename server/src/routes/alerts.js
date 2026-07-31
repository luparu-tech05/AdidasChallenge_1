import { Router } from "express";
import { AppError } from "../errors.js";
import { adminAuthentication } from "../middleware/auth.js";

export function alertsRouter(db) {
  const router = Router();

  router.get("/", (request, response) => {
    const status = (request.query.status || "OPEN").toUpperCase();
    if (!["OPEN", "RESOLVED", "ALL"].includes(status)) {
      throw new AppError(
        422,
        "INVALID_FILTER",
        "status must be OPEN, RESOLVED, or ALL."
      );
    }

    const where = status === "ALL" ? "" : "WHERE a.status = ?";
    const values = status === "ALL" ? [] : [status];
    const data = db
      .prepare(
        `SELECT a.id, p.sku AS productSku, p.name AS productName,
          a.observed_quantity AS observedQuantity, a.threshold,
          a.status, a.opened_at AS openedAt, a.resolved_at AS resolvedAt
         FROM alerts a
         JOIN products p ON p.id = a.product_id
         ${where}
         ORDER BY a.opened_at DESC`
      )
      .all(...values);
    response.json({ data });
  });

  router.put(
    "/thresholds/:sku",
    adminAuthentication,
    (request, response) => {
      const quantity = request.body.quantity;
      if (!Number.isInteger(quantity) || quantity < 0) {
        throw new AppError(
          422,
          "VALIDATION_ERROR",
          "Threshold quantity must be a non-negative integer."
        );
      }

      const product = db
        .prepare("SELECT id, sku FROM products WHERE sku = ?")
        .get(request.params.sku);
      if (!product) {
        throw new AppError(404, "PRODUCT_NOT_FOUND", "Product SKU was not found.");
      }

      db.prepare("UPDATE products SET threshold = ? WHERE id = ?").run(
        quantity,
        product.id
      );
      response.json({
        data: { productSku: product.sku, threshold: quantity }
      });
    }
  );

  return router;
}
