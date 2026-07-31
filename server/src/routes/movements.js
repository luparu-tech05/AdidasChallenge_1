import { Router } from "express";
import { storeAuthentication } from "../middleware/auth.js";
import { recordMovement } from "../inventory.js";

export function movementsRouter(db) {
  const router = Router();

  router.post("/", storeAuthentication(db), (request, response) => {
    const result = recordMovement(
      db,
      request.store,
      request.get("Idempotency-Key"),
      request.body
    );
    response.status(result.replayed ? 200 : 201).json({ data: result });
  });

  return router;
}
