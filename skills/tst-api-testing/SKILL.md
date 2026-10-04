---
name: tst-api-testing
description: "Tests API surfaces with effort proportional to risk: schema validation, auth flows, edge cases, and contract verification. Use when testing API surfaces, when schemas drift from specs, when auth flows need proof, or when deciding how many tests an endpoint actually needs."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: tester
  sdlc-stage: testing
  version: 1.1.0
---

# API Testing

## Overview

API tests are the contract's referee: they prove the running surface still matches the promise (`arch-api-contract-design`) — schemas, status semantics, error shapes, auth behavior, and edge cases. Where lower tiers test components and e2e tests journeys, API testing tests the **surface as users' code sees it**: fast, isolated, and ruthless about the contract.

## When to Use

- Testing a REST/GraphQL/gRPC surface (new endpoints or whole suites).
- Schema drift between spec and implementation must be caught in CI.
- Auth flows (login, tokens, permissions, ownership) need proof at the depth the endpoint's risk earns.
- Edge behavior (validation, conflicts, idempotency, pagination) needs coverage beyond the happy path.
- Deciding proportional coverage per endpoint ("should every endpoint get boundary tests?").

**When NOT to use:**

- Implementation logic inside the service (unit tier), component wiring (integration tier), or UI re-testing of what the API already asserts.
- Designing the API contract itself — that is `arch-api-contract-design`; this skill VERIFIES it.
- The business rule itself — the domain owns that; this skill verifies the rule's projection onto HTTP.
- Endpoints already covered by spec-driven or schema-driven generation, where hand-written cases only duplicate the generator.
- Pruning an oversized API suite — that is `tst-test-minimization`.

## Process

### Step 1 — Size the tier by risk, before writing any case

Classify every endpoint by blast radius, then let the class set the depth:

- **High** — moves money, changes state, exposes another principal's data, or is externally visible and on a core journey.
- **Medium** — mutating with a small blast radius, or a read that projects something sensitive.
- **Low** — a thin read, no principal-data exposure, no side effects.

Then apply proportional depth:

- A **low-risk read earns a fixed floor of three cases**: one happy path, one auth check, one response-shape check. That floor is sufficient — resist adding a fourth.
- Only **high**-risk endpoints earn the full treatment (partitions × boundaries × decision tables × state transitions).
- Medium endpoints get the floor plus the negative and failure shapes.
- This is the arithmetic that decides the tier's size: running the full toolbox on every endpoint turns three endpoints into a hundred cases, and those hundred cases mostly re-assert rules a lower tier already decided.

### Step 2 — Assert the contract, not just the status

For every case, verify the promise: **status code, response schema (against the spec/OpenAPI), error shape (code/message/field), and headers** (content-type, idempotency, rate-limit). "200" alone is a screenshot; the schema assertion is the contract check. Schema-first suites run the response through the spec validator — drift fails here, before a client discovers it.

### Step 3 — Cover the auth surface, scoped by the endpoint's risk class

"Systematically" means *per risk class*, not *the same matrix everywhere*:

- **Low-risk read** — one missing-credential case and one invalid-credential case, folded into the three-case floor of Step 1. Do not build the full matrix for a read that exposes no principal data.
- **Medium and high risk** — the full AuthN matrix: valid credentials, invalid credentials, expired/revoked tokens, malformed tokens, missing auth.
- **High risk only** — token/session lifecycle where the API promises it: refresh, rotation, invalidation on privilege change.
- **Wherever another principal's data is reachable (medium or high)** — AuthZ per resource: role present vs absent, and the object-level check — user A requesting user B's resource must be asserted (deny), not assumed (per `be-security-engineering`). A low-risk read with no principal-data exposure has no cross-principal case to write.

### Step 4 — Edge cases from the design toolbox, scoped by risk

Apply `tst-test-design-techniques` only where Step 1 says the endpoint earns it, and apply it to the **projection**, not the rule:

- **Business rules owned by the domain are excluded from the surface test set.** The API test asserts how a rule surfaces — status code, response schema, error translation, authZ decision — not the rule's arithmetic.
- Diagnostic: if an API test breaks because someone changed a discount percentage, the assertion is in the wrong tier; it belongs in the domain test (`tst-unit-testing`).
- For eligible endpoints: valid/invalid partitions per field, boundary values (page sizes, string length caps, number ranges), decision tables for filter combinations, and state-transition walks for stateful endpoints (cancel after ship = 409/422, not 200).

### Step 5 — Include the negative and failure shapes

- Validation: malformed payload, unknown fields (if the API promises strictness), oversized bodies.
- Conflict/concurrency: duplicate idempotency key, optimistic-lock mismatches.
- Dependencies: the API's behavior when its downstream fails (5xx from the adapter, timeout) — the surface must return its CONTRACTED error, not a naked 500 (via mocks of the seam, per `tst-integration-testing`).

### Step 6 — Run them as a fast, isolated suite

- API tests hit a real or full-fidelity loopback of the service (testcontainers for its dependencies), with seeded data; suite in seconds-to-minutes.
- Deterministic seeds and isolated DB state per run (`tst-integration-testing` §2) — the surface tests must not depend on each other.
- Wire into CI as a contract/API gate (pre-merge); drill the auth and schema checks on the release gate too.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Status 200 is enough for the test" | The schema is the contract; without schema assertion, drift ships silently. |
| "Auth is tested once in login" | AuthZ-per-resource is where the exposure lives; one login test covers none of it. |
| "We don't test validation in DevQA, the client handles it" | The client handling it is exactly the contract the server must still enforce. |
| "Mocking the downstream hides real behavior" | The surface's job is to return ITS contract error when downstream fails — mock the seam, assert the surface. |
| "Postman collections are enough" | Collections are documentation, not assertions; CI-wired schema+behavior suites are tests. |
| "Every endpoint deserves the full boundary matrix" | Proportionality: a low-risk read is protected by the three-case floor; depth is reserved for high blast radius. |
| "This API test checks the business rule, so it belongs here" | If it fails when a domain value changes but the HTTP projection did not, the assertion is in the wrong tier. |

## Red Flags

- The full technique toolbox applied to every endpoint regardless of risk
- A low-risk endpoint carrying a full boundary matrix
- A business rule re-asserted at the surface beyond its projection
- Assertions without schema validation (drift-friendly)
- A "200-only" case whose schema assertion was dropped because the happy path passed
- A cross-principal endpoint with no authZ-per-resource case (happy-path auth only)
- Boundary/combination coverage missing on validation-heavy endpoints
- Downstream failures surfacing as naked 500s with no contracted error
- Suites depending on each other or on shared mutable state
- Contract gate not wired into CI

## Verification

- [ ] Every endpoint classified by blast radius, case count justified against its class; low-risk endpoints left at the three-case floor
- [ ] Every case asserts status + schema (+ error shape where relevant), schema present on every non-error case
- [ ] AuthN and AuthZ covered at the depth the endpoint's risk class earns — full matrix on high risk, floor only on low-risk reads
- [ ] Partitions, boundaries, decision tables, state transitions applied only to eligible endpoints; business rules not re-asserted at the surface beyond their projection
- [ ] Negative/failure shapes: validation, conflict, downstream-failure contracted responses
- [ ] Fast isolated loopback suite with deterministic seeds; CI contract gate wired pre-merge
- [ ] No "200-only" tests; no client-assumes-validation rationalization