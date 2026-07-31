[← README](/README.md) | **Requirements and Scope** | [Architecture →](architecture.md)

---

# Requirements and Scope

## Problem statement

When several stores report receipts and sales independently, requests can be
invalid, repeated, or received close together. Updating only a central number
would make it difficult to know which store caused a change and could count a
retry twice.

The system therefore stores each accepted movement, updates the affected store
balance, and derives the network total from all store balances.

## Target users

| User | Need |
|---|---|
| Simulated store system | Report one stock entry or sale securely and retry safely. |
| Inventory analyst | Search products and compare availability across stores. |
| Operations manager | Find products at or below their network threshold. |
| Evaluator | Verify the API behavior through a clear interface and tests. |

## Functional requirements

| ID | Requirement | Acceptance condition |
|---|---|---|
| FR-01 | Authenticate a reporting store | A missing or invalid `X-API-Key` returns `401`. |
| FR-02 | Report a stock movement | A valid `IN` or `OUT` request returns the resulting store and network balances. |
| FR-03 | Prevent duplicate processing | Repeating the same store/key/request returns the original result and does not change stock. |
| FR-04 | Reject unsafe stock | A sale that would make one store negative returns `409` and changes nothing. |
| FR-05 | Consolidate inventory | The inventory response returns the sum of all store balances per product. |
| FR-06 | Filter inventory | Product text, exact store code, and maximum network stock are supported. |
| FR-07 | Configure thresholds | An admin demo key can update the network threshold for a product. |
| FR-08 | Manage alerts | A movement opens an alert at or below the threshold and resolves it above the threshold. |
| FR-09 | Demonstrate the API in React | Inventory, product detail, alerts, and a movement simulator use the real API. |
| FR-10 | Show movement history | Product detail shows the latest accepted movements. This is optional in the challenge but implemented here. |

## Business rules

1. A store API key identifies exactly one store.
2. A store can report only its own movement.
3. Movement type is `IN` or `OUT`.
4. Quantity is a positive integer.
5. A product SKU must already exist.
6. A store balance can never be negative.
7. The pair `(store, idempotency key)` is unique.
8. Reusing that pair with different request data returns a conflict.
9. The network total is calculated by the server; clients never send it.
10. One threshold is configured per product for the complete network.
11. An alert is open when the network total is at or below the threshold.
12. Timestamps are stored in UTC and displayed in the browser locale.

## Non-functional requirements

| Quality | Exercise target |
|---|---|
| Correctness | Movement, balance, and alert logic run inside one SQLite transaction. |
| Reliability | Idempotency protects safe retries. |
| Security | Keys are hashed, inputs are validated, and errors do not expose internals. |
| Usability | The main status is understandable in under 30 seconds. |
| Accessibility | Keyboard navigation, visible focus, semantic controls, text status, and responsive layout. |
| Maintainability | One responsibility per router and a short, documented main flow. |
| Testability | Core happy paths and failure paths run with an in-memory database. |
| Explainability | The student can trace one request without learning an ORM or state library. |

## Scope

### MVP

- Seeded stores and products
- API-key authentication
- Transactional stock movements
- Idempotency
- Consolidated inventory and filters
- Product-level network threshold
- Persisted in-app alerts
- Movement history
- Three-route React interface
- Automated API tests

### Deliberately excluded

- Real point-of-sale integration
- Email, SMS, Slack, or Teams delivery
- Enterprise login
- Store-level threshold overrides
- Transfers, reservations, forecasting, and offline synchronization
- Multi-region infrastructure

## Success measures

- All automated API tests pass.
- The production React build succeeds.
- The dependency audit reports no known vulnerabilities.
- The six-minute demo covers the required presentation topics.
- The student can explain the request flow, transaction, idempotency rule, and
  one technology tradeoff in her own words.


---

[? README](/README.md) | **Requirements and Scope** | [Architecture ?](architecture.md)
