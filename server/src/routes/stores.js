import { Router } from "express";

export function storesRouter(db) {
  const router = Router();

  router.get("/", (_request, response) => {
    const data = db
      .prepare(
        "SELECT code, name FROM stores WHERE active = 1 ORDER BY name"
      )
      .all();
    response.json({ data });
  });

  return router;
}
