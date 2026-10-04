# Audit sheet — inventory template and worked example

One row per test. A row that cannot produce a one-sentence behavior is itself the finding; write "cannot describe" in the behavior cell and mark it DELETE. Template below is copy-pasteable; the filled example row is the shape of every row.

## Template

| test id | layer | behavior (one sentence) | oracle | collaborators | kills mutants | verdict | reason |
|---|---|---|---|---|---|---|---|
| `OrderTest#discountsSeniorMember` | domain | A member over 60 gets 10% off. | total == 90.00 for a 100.00 order | none | 3 | KEEP | sole owner of the discount oracle (row 1) |

## Worked example — small API: 3 REST endpoints, external pricing client, API-key auth, DDD layers

| test id | layer | behavior (one sentence) | oracle | collaborators | kills mutants | verdict | reason |
|---|---|---|---|---|---|---|---|
| `OrderTest#discountsSeniorMember` | domain | A member over 60 gets 10% off. | total == 90.00 | none | 3 | KEEP | lowest tier that decides the rule; sole owner of the oracle |
| `PlaceOrderTest#discountsSeniorMember` | use-case | A member over 60 gets 10% off, reached through the use case. | order.total == 90.00 | OrderRepository stub, Pricer real | 0 | DELETE | (c) same behavior, same oracle as row 1 |
| `orders.api.spec#POST /orders discounted total` | e2e | A member over 60 gets 10% off, over HTTP. | body.total == 90.00 | real API, client stubbed | 0 | QUARANTINE | third owner of row 1's rule; DELETE (c) once the wiring oracle is asserted elsewhere |
| `PricingClientTest#maps 500 to typed error` | external-client | An upstream 500 becomes `PricingUnavailable`. | raised == PricingUnavailable | http stub | 1 | KEEP | sole owner of the error-mapping oracle |
| `ApiKeyAuthTest#rejects missing key` | controller | A request without `X-Api-Key` gets 401. | status == 401 | none (real middleware) | 2 | KEEP | auth rule; one representative per class, not one per endpoint |
| `orders.controller.spec#rejects missing key` | controller | The same 401 rule on a second endpoint. | status == 401 | none | 0 | DELETE | (c) duplicate oracle; the rule is parameterized over endpoints |
| `OrderMapperTest#maps row to order` | repository-adapter | Cannot describe: copies fields from a row. | private field only | none | 0 | DELETE | (e)/(b) plumbing — restates a field list the round-trip test already pins; no rule of its own to get wrong |
| `PriceCalculatorTest#returns total` | domain | Cannot describe: returns what it was given. | result == input, expected copied from actual | none | 0 | DELETE | (b) tautology — passes against every mutant by construction |
| `HealthCheckTest#GET /health` | e2e | A bootable app answers the health probe with 200. | status == 200 | none | 1 | KEEP | low risk, but unique oracle; never-failing is not worthless |
| `OrderRepositoryIT#persists status` | repository-adapter | A placed order is written with its status. | row exists, status == 'PLACED' | real DB | 0 | QUARANTINE | persistence of a value the domain already decides; re-measure once the mapper is gone |

Three findings in ten rows: one rule owned three times (rows 1–3), two tests with no oracle at all (mapper, calculator), one class deleted twice over (rows 5–6) where the second deletion would have removed the auth rule entirely. The sheet is the argument; the mutation run is the receipt.
