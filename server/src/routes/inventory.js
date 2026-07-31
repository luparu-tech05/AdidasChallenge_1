import { Router } from "express";
import { AppError } from "../errors.js";
import { getProduct, listInventory } from "../inventory.js";

function parseMaxStock(value) {
  if (value === undefined) return undefined;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw new AppError(
      422,
      "INVALID_FILTER",
      "maxStock must be a non-negative integer."
    );
  }
  return number;
}

export function inventoryRouter(db) {
  const router = Router();

  router.get("/", (request, response) => {
    const data = listInventory(db, {
      product: request.query.product?.trim(),
      store: request.query.store?.trim(),
      maxStock: parseMaxStock(request.query.maxStock)
    });
    response.json({ data });
  });

  router.get("/:sku", (request, response) => {
    response.json({ data: getProduct(db, request.params.sku) });
  });

  return router;
}
