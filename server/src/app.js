import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";
import { alertsRouter } from "./routes/alerts.js";
import { inventoryRouter } from "./routes/inventory.js";
import { movementsRouter } from "./routes/movements.js";
import { storesRouter } from "./routes/stores.js";

export function createApp(db) {
  const app = express();

  app.use(
    cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" })
  );
  app.use(express.json({ limit: "32kb" }));
  app.use((request, response, next) => {
    request.requestId = request.get("X-Request-Id") || randomUUID();
    response.set("X-Request-Id", request.requestId);
    next();
  });

  app.get("/health", (_request, response) => {
    db.prepare("SELECT 1").get();
    response.json({ status: "ok" });
  });

  app.use("/api/movements", movementsRouter(db));
  app.use("/api/inventory", inventoryRouter(db));
  app.use("/api/alerts", alertsRouter(db));
  app.use("/api/stores", storesRouter(db));

  app.use((_request, response) => {
    response.status(404).json({
      error: { code: "NOT_FOUND", message: "Route not found." }
    });
  });

  app.use((error, request, response, _next) => {
    const status = error.status || 500;
    const payload = {
      error: {
        code: error.code || "INTERNAL_ERROR",
        message:
          status === 500 ? "An unexpected error occurred." : error.message,
        requestId: request.requestId
      }
    };
    if (error.details) payload.error.details = error.details;
    if (status === 500) console.error(error);
    response.status(status).json(payload);
  });

  return app;
}
