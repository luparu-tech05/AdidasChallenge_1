# First Adidas Challenge
Store-to-Store Inventory Synchronization System

- Autor: Lucero Patricia Rueda Galván
- Email: luceparu05@gmail.com
- <a href="https://youtu.be/4Pz5OfSdmJg" target="_blank" rel="noopener noreferrer">Explaining the Project – English Version</a>

This folder contains the complete API,  React demonstration interface and Documentation.

## Project overview

Simulated stores report product entries and sales to a central API. The API
validates each request, updates the store balance safely, calculates the total
stock across the network, and opens an alert when that total reaches a
configurable threshold.

A small React dashboard makes the API easy to demonstrate without requiring
Postman. It shows network inventory, product details, store balances, movement
history, and low-stock alerts. It also contains a clearly labeled demo form for
submitting a real movement to the API.

## Goals

- Keep store and network totals consistent.
- Make repeated requests safe through idempotency.
- Reject invalid credentials, data, and negative stock.
- Filter inventory by store, product, and maximum network stock.
- Demonstrate configurable low-stock alerts.
- Keep the code small enough for one student to understand and explain.

## Core design idea

The solution is a **modular monolith**: one Express application, one SQLite
database, and one React application.

- **Express Router** groups API routes by subject.
- **React Router** maps each URL to one screen.
- **SQLite transactions** keep a movement, balance, and alert consistent.
- **Plain JavaScript and visible SQL** reduce the number of concepts to learn.

This is intentionally simpler than a microservice, event-driven, ORM-based, or
multi-package architecture. Those options may be useful at enterprise scale,
but they would not improve this short individual exercise.

## Features

| Requirement | Working evidence |
|---|---|
| Report stock in/out by store | `POST /api/movements` |
| Consolidate stock by product | `GET /api/inventory` |
| Product, store, and low-stock filters | Query parameters on inventory |
| Configurable alert threshold | Admin threshold endpoint |
| Store API-key authentication | Hashed keys and route middleware |
| Optional movement history | Product detail API and screen |
| Minimal demonstration UI | Three React Router screens and simulator |

## Technologies used

- Node.js and Express
- Express Router
- SQLite through `better-sqlite3`
- React, React Router, and Vite
- Native Node.js test runner and Supertest
- Plain CSS with responsive and accessible states

## Setup instructions

Requirements: Node.js 20 or newer and npm 10 or newer.

```bash
cd code
npm install
copy .env.example .env
npm run dev
```

On macOS or Linux, replace `copy` with `cp`.

Open:

- Dashboard: `http://localhost:5173`
- API: `http://localhost:3000/api`
- Health check: `http://localhost:3000/health`

Run the quality checks:

```bash
npm test
npm run build
npm audit
```

See [code/README.md](code/README.md) for demo credentials and a source-code map.

## Main demonstration

1. Open the network inventory page.
2. Submit a stock-out movement with the built-in demo form.
3. Show that the store balance and network total change together.
4. Open the product detail through its route.
5. Repeat the same API request with the same idempotency key and show that the
   stock does not change twice.
6. Cross a threshold and inspect the alert route.
7. Show the automated tests for invalid keys and negative stock.


## Folder map

```text
code/
  server/
    src/
      routes/         Express Router files: one per API subject
      database.js     schema, seed data, and database connection
      inventory.js    stock transaction and query logic
      app.js          middleware and route assembly
  client/
    src/
      pages/          React Router screens
      components/     shared visual components
      api.js          all calls to the Express API
      App.jsx         route map
  docs/
    architecture.md   documentation of architecture
    data-and-api.md   documentation of architecture
    delivery-plan.md  documentation of architecture
    requirements.md   documentation of architecture
    traceability.md   documentation of architecture
    ux-design.md     documentation of architecture
```

## Documentation

- [Requirements and scope](/docs/requirements.md)
- [Architecture and routing](/docs/architecture.md)
- [Data model and API](/docs/data-and-api.md)
- [UX design](/docs/ux-design.md)
- [Delivery, testing, and security](/docs/delivery-plan.md)
- [Rules traceability](/docs/traceability.md)
- [Editable wireframes](/design/wireframes.svg) and [PNG preview](/design/wireframes.png)

## Known issues and limitations

- Demo keys are intentionally visible for local evaluation. Production keys
  would be issued and rotated through a secure identity system.
- SQLite is appropriate for this single-process exercise, not a globally
  distributed store network.
- Alert delivery is in-app only. Email, SMS, and messaging are not implemented.
- Thresholds are configured per product at network level, not per store.
- The server performs small, readable queries instead of heavily optimized
  reporting queries. This is appropriate for the seeded demonstration data.
- Reservations, transfers, returns inspection, forecasting, and offline
  synchronization are outside the MVP.
