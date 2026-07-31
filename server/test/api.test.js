import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";
import { createDatabase } from "../src/database.js";

function setup() {
  const db = createDatabase(":memory:");
  return { db, app: createApp(db) };
}

test("health endpoint reports a working database", async () => {
  const { db, app } = setup();
  const response = await request(app).get("/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
  db.close();
});

test("a store can report stock and retry safely", async () => {
  const { db, app } = setup();
  const movement = {
    productSku: "SAMBA-OG-WHT-42",
    type: "IN",
    quantity: 2,
    reference: "DELIVERY-100"
  };

  const first = await request(app)
    .post("/api/movements")
    .set("X-API-Key", "store-bogota-key")
    .set("Idempotency-Key", "demo-001")
    .send(movement);
  const replay = await request(app)
    .post("/api/movements")
    .set("X-API-Key", "store-bogota-key")
    .set("Idempotency-Key", "demo-001")
    .send(movement);

  assert.equal(first.status, 201);
  assert.equal(first.body.data.resultingBalance, 8);
  assert.equal(replay.status, 200);
  assert.equal(replay.body.data.replayed, true);
  assert.equal(replay.body.data.resultingBalance, 8);
  db.close();
});

test("invalid credentials and negative stock are rejected", async () => {
  const { db, app } = setup();
  const body = {
    productSku: "ADIZERO-BOSTON-13-40",
    type: "OUT",
    quantity: 50
  };

  const unauthorized = await request(app)
    .post("/api/movements")
    .set("X-API-Key", "wrong")
    .set("Idempotency-Key", "demo-002")
    .send(body);
  const conflict = await request(app)
    .post("/api/movements")
    .set("X-API-Key", "store-bogota-key")
    .set("Idempotency-Key", "demo-003")
    .send(body);

  assert.equal(unauthorized.status, 401);
  assert.equal(conflict.status, 409);
  assert.equal(conflict.body.error.code, "INSUFFICIENT_STOCK");
  db.close();
});

test("inventory supports product, store, and low-stock filters", async () => {
  const { db, app } = setup();
  const response = await request(app).get(
    "/api/inventory?product=adizero&store=BOG-CALLE82&maxStock=5"
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.data.length, 1);
  assert.equal(response.body.data[0].sku, "ADIZERO-BOSTON-13-40");
  assert.equal(response.body.data[0].networkTotal, 4);
  assert.equal(response.body.data[0].stores.length, 1);
  assert.equal(response.body.data[0].stores[0].code, "BOG-CALLE82");
  db.close();
});

test("crossing the configurable network threshold opens an alert", async () => {
  const { db, app } = setup();
  const threshold = await request(app)
    .put("/api/alerts/thresholds/SAMBA-OG-WHT-42")
    .set("X-Admin-Key", "admin-demo-key")
    .send({ quantity: 9 });
  const movement = await request(app)
    .post("/api/movements")
    .set("X-API-Key", "store-bogota-key")
    .set("Idempotency-Key", "demo-alert")
    .send({
      productSku: "SAMBA-OG-WHT-42",
      type: "OUT",
      quantity: 1
    });
  const alerts = await request(app).get("/api/alerts");

  assert.equal(threshold.status, 200);
  assert.equal(movement.status, 201);
  assert.equal(movement.body.data.alertOpened, true);
  assert.equal(alerts.body.data[0].observedQuantity, 9);
  db.close();
});

test("two simultaneous sales cannot oversell one store balance", async () => {
  const { db, app } = setup();
  const sale = {
    productSku: "ADIZERO-BOSTON-13-40",
    type: "OUT",
    quantity: 2
  };

  const [first, second] = await Promise.all([
    request(app)
      .post("/api/movements")
      .set("X-API-Key", "store-bogota-key")
      .set("Idempotency-Key", "concurrent-1")
      .send(sale),
    request(app)
      .post("/api/movements")
      .set("X-API-Key", "store-bogota-key")
      .set("Idempotency-Key", "concurrent-2")
      .send(sale)
  ]);

  assert.deepEqual(
    [first.status, second.status].sort(),
    [201, 409]
  );
  const product = await request(app).get(
    "/api/inventory/ADIZERO-BOSTON-13-40"
  );
  const bogota = product.body.data.stores.find(
    (store) => store.code === "BOG-CALLE82"
  );
  assert.equal(bogota.quantity, 0);
  db.close();
});
