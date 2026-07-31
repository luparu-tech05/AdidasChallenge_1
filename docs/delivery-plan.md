# Delivery, Testing, and Security

## Phased delivery

| Phase | Output | Exit condition |
|---|---|---|
| 1. Understand | Rules, challenge, users, and acceptance conditions | Every core feature has a testable statement. |
| 2. Design | Data model, routes, user flow, and wireframes | The main request can be explained without code. |
| 3. Build API | Authentication, movement transaction, queries, and alerts | Core API tests pass. |
| 4. Build UI | Inventory, product, alerts, and simulator routes | The API can be demonstrated without Postman. |
| 5. Refine | Responsive states, errors, README, and attributions | A fresh install is documented. |
| 6. Rehearse | Reset data and record the English demo | Two practice runs finish below 5:40. |

## Priority order

### Must

- Authentication
- Stock in/out
- Transaction and negative-stock protection
- Idempotency
- Consolidated total and filters
- Configurable alert
- Minimal React demonstration UI
- README, wireframes, and tests

### Added value

- Movement history
- Product detail route
- Built-in movement simulator
- Clear empty, loading, success, and error states
- Student learning guide

### Not included

- Real notifications
- Enterprise login
- Forecasting
- Store transfers
- Cloud infrastructure

## Automated test matrix

| Behavior | Current evidence |
|---|---|
| API and database are available | Health test |
| Valid stock update | Movement test |
| Safe retry | Same test verifies `replayed: true` and unchanged balance |
| Invalid credential | Authentication test |
| Negative stock rollback | Conflict test |
| Product, store, and low-stock filters | Inventory filter test |
| Configurable threshold and alert | Alert test |
| Simultaneous sales cannot oversell | Concurrency test |
| Production UI compilation | `npm run build` |
| Dependency safety | `npm audit` |

## Manual test checklist

- Use the form to add and remove stock.
- Open the resulting product detail.
- Reduce a product to its threshold and open the alerts route.
- Try an amount larger than one store balance and read the error.
- Navigate with the keyboard only.
- Check layout near desktop, tablet, and 320 px widths.
- Reset the database and repeat the demo.

## Security controls

- Store API keys are hashed with SHA-256 at rest.
- Hash comparison uses a constant-time function.
- The authenticated store is derived from the key, not from request data.
- The request body is limited to 32 KB.
- Movement fields and query filters are validated.
- SQLite constraints protect non-negative balances and duplicate keys.
- Server errors return a request ID and hide stack traces.
- CORS is restricted to the configured client origin.
- `.env`, local databases, logs, dependencies, and builds are excluded from Git.

The visible demo keys are not production secrets. Their purpose is to let an
evaluator reproduce the exercise locally.

## Risks

| Risk | Impact | Response |
|---|---|---|
| Student cannot explain the architecture | High | Use a modular monolith, plain JavaScript, and the learning guide. |
| A repeated request changes stock twice | High | Transaction, request signature, unique constraint, and test. |
| A sale makes a store negative | High | Validate inside the same transaction before any write. |
| Scope exceeds the timebox | High | Complete the Must list before optional polish. |
| Demo state is unpredictable | Medium | Deterministic seed and reset command. |
| UI hides API value | Medium | Include a real movement simulator and product history. |
| Generated or reused work is not credited | High | Maintain `ATTRIBUTIONS.md` before publication. |

## Definition of done

- README contains overview, goals, technologies, setup, and limitations.
- Core API and UI behavior is functional.
- Tests, production build, and dependency audit pass.
- Wireframes and diagrams match the implemented routes and data rules.
- All repository documentation is in English.
- The presentation script covers all mandatory topics in six minutes.
- The student has reviewed the work and can explain each core decision.
