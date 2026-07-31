[← README](/README.md) | [← Requirements](requirements.md) | **Architecture and Routing** | [Data Model and API →](data-and-api.md)

---

# Architecture and Routing

## The architecture in one sentence

A React single-page application calls one Express API, and the API uses one
SQLite database as the source of truth.

## System context

```mermaid
flowchart LR
    Store["Simulated store"] -->|"Movement + API key"| API["Express API"]
    User["Inventory user"] -->|"Views and filters"| Web["React application"]
    Web -->|"JSON over HTTP"| API
    API --> DB[("SQLite")]
```

## Why a modular monolith

The challenge is completed by one student and demonstrated in six minutes. A
single deployable server keeps setup and debugging simple. Modules still
separate routing, authentication, business logic, and database access, so the
solution is organized without becoming fragmented.

This choice avoids:

- microservices and message brokers;
- an ORM and generated migrations;
- a client state-management library;
- separate repositories or shared contract packages.

These are valid tools for larger systems, but they add concepts that are not
needed to prove the challenge requirements.

## Component view

```mermaid
flowchart TB
    subgraph Browser["React application"]
      RR["React Router"]
      Pages["Inventory / Product / Alerts pages"]
      Client["Small fetch API module"]
      RR --> Pages --> Client
    end

    subgraph Server["Express application"]
      ER["Express Router"]
      Auth["API-key middleware"]
      Logic["Inventory transaction"]
      ER --> Auth --> Logic
    end

    Client -->|"HTTP / JSON"| ER
    Logic --> DB[("SQLite tables")]
```

## Router maps

Express Router answers: **Which server function handles this HTTP request?**

| Route module | Mounted path | Responsibility |
|---|---|---|
| `movements.js` | `/api/movements` | Authenticated stock writes |
| `inventory.js` | `/api/inventory` | Inventory list, filters, and product detail |
| `alerts.js` | `/api/alerts` | Alert list and threshold update |
| `stores.js` | `/api/stores` | Store options for the interface |

React Router answers: **Which page appears for this browser URL?**

| Browser route | Page |
|---|---|
| `/inventory` | Network inventory and API movement simulator |
| `/products/:sku` | Store balances and recent movements for one product |
| `/alerts` | Open, resolved, or all alerts |

The two routers solve the same navigation idea at different boundaries. This
parallel makes them easy to learn together.

## Critical write flow

```mermaid
sequenceDiagram
    participant Store
    participant Route as Express route
    participant Logic as Inventory transaction
    participant DB as SQLite

    Store->>Route: POST /api/movements
    Route->>Route: Validate API key
    Route->>Logic: Store + idempotency key + body
    Logic->>DB: Begin transaction
    Logic->>DB: Find movement by store and key
    alt Same request already exists
        DB-->>Logic: Original result
        Logic-->>Store: 200 replayed = true
    else New request
        Logic->>DB: Read store balance
        Logic->>Logic: Calculate and reject negative stock
        Logic->>DB: Update balance and insert movement
        Logic->>DB: Calculate network total
        Logic->>DB: Open, update, or resolve alert
        Logic->>DB: Commit
        Logic-->>Store: 201 accepted result
    end
```

## Consistency and concurrency

SQLite runs in WAL mode with a five-second busy timeout. The write operation is
a synchronous `better-sqlite3` transaction. Within this one Node.js process,
stock writes cannot interleave inside the critical section.

The database also has a unique constraint on `(store_id, idempotency_key)`.
This is the final protection against counting the same store request twice.

The movement table is the audit history. The balance table is the current state
used for fast reads. Both are updated inside the same transaction.

## Source structure

```text
/
  server/
    src/
      routes/
      middleware/
      app.js
      database.js
      inventory.js
      server.js
    test/
  client/
    src/
      pages/
      components/
      api.js
      App.jsx
      styles.css
  docs/
    architecture.md
    data-and-api.md
    delivery-plan.md
    requirements.md
    traceability.md
    ux-design.md
```

## Key decisions and tradeoffs

| Decision | Benefit for this exercise | Limitation |
|---|---|---|
| Plain JavaScript | Less syntax and build configuration to learn | Fewer compile-time checks than TypeScript |
| Visible SQL | Data behavior is easy to trace | More manual mapping than an ORM |
| SQLite | Zero-service local setup and real transactions | Not a multi-region production database |
| One network threshold per product | Directly satisfies the challenge | No store-specific thresholds |
| Native `fetch` and React state | Few client concepts | No caching library |
| Modular monolith | Easy to run, test, and explain | Would need evolution for very large scale |

## Production evolution

If the fictional network became real and global, the next steps would be
PostgreSQL, a managed identity provider, an outbox for reliable events,
observability, rate limiting, and separate read models. They are described only
as an evolution path and are not presented as implemented features.


---

[? README](/README.md) | [? Requirements](requirements.md) | **Architecture and Routing** | [Data Model and API ?](data-and-api.md)
