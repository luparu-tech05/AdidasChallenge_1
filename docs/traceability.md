[← README](/README.md) | [← Delivery Plan](delivery-plan.md) | **Rules and Challenge Traceability**

---

# Rules and Challenge Traceability

## Rules and Guidelines

| Official rule | Evidence in this repository | Verification before submission |
|---|---|---|
| Individual contribution is evaluated | Student ownership note and learning guide | Student reviews each file and owns final commits |
| Technical implementation | Express API, SQLite, React UI, tests | Run `npm test` and `npm run build` |
| Visual design and UI quality | Responsive CSS and three-screen wireframe | Review desktop and mobile states |
| UX and usability | User flow, labels, feedback, empty states, and accessibility | Complete manual checklist |
| Third-party libraries are allowed | Dependencies and attribution file | Keep lockfile and credits |
| Student explains all details | Simple architecture and code walkthrough | Rehearse without reading |
| Non-core features may be simulated | External notifications are explicitly excluded | State this in the demo |
| Core features must work | FR-01 to FR-09 and automated tests | Demonstrate the real API |
| Public repository | Repository-ready project structure | Publish after personal review |
| README overview and goals | Root README | Confirm final wording |
| README technologies | Root README | Match installed packages |
| README setup instructions | Root and code READMEs | Test from a fresh clone |
| README known limitations | Root README | Do not overclaim |
| Design artifacts | Mermaid diagrams, UX flow, and SVG wireframes | Keep them aligned with code |
| Work planned in phases | Delivery document | Explain the sequence if asked |
| Six-minute English demo | Timed script | Record two practice runs |
| Problem and target users | README and requirements | Cover in the first 35 seconds |
| Key features and live demo | Simulator and demo script | Show a real movement |
| Design and UX decisions | UX document and UI | Explain route and status choices |
| Technical architecture | Architecture document | Explain one request end to end |
| Challenges and lessons | Demo script sample | Replace with real reflection |
| All documentation in English | All repository documents | Final language review |

## Challenge 1

| Challenge feature | Implementation |
|---|---|
| Report store stock changes | `POST /api/movements` with `IN` and `OUT` |
| Consolidated product inventory | Server sum of all store balances |
| Store filter | `store` query parameter |
| Product filter | `product` query parameter |
| Low-stock range filter | `maxStock` query parameter |
| Configurable low-stock alerts | Product threshold endpoint and persisted alert |
| API key or token | Hashed store API key middleware |
| Optional product movement history | Product detail endpoint and page |
| Node.js and Express | Implemented server |
| REST validation and error handling | Route validation and central error middleware |
| Concurrency and consistency | SQLite transaction and idempotency constraint |
| SQLite or structured JSON | SQLite relational model |
| Minimal API demonstration UI | React Router dashboard and simulator |

## Acceptance evidence

| Requirement | Automated | Live demo |
|---|---:|---:|
| Authentication | Yes | Optional |
| Stock update | Yes | Yes |
| Idempotency | Yes | Yes |
| Negative stock | Yes | Yes |
| Consolidation | Indirectly | Yes |
| Filters | Yes | Yes |
| Threshold configuration | Yes | Optional |
| Alert creation | Yes | Yes |
| React routes | Production build | Yes |
| Movement history | API response | Yes |


---

[? README](/README.md) | [? Delivery Plan](delivery-plan.md) | **Rules and Challenge Traceability**
