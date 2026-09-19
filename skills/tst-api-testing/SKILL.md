---
name: tst-api-testing
description: "Tests API surfaces: schema validation, auth flows, edge cases, and contract verification. Use when testing API surfaces, when schemas drift from specs, when auth flows need proof, or when an API's edge behavior needs systematic coverage beyond happy paths."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: tester
  sdlc-stage: testing
  version: 1.0.0
---

# API Testing

## Overview

API tests are the contract's referee: they prove the running surface still matches the promise (`arch-api-contract-design`) — schemas, status semantics, error shapes, auth behavior, and edge cases. Where lower tiers test components and e2e tests journeys, API testing tests the **surface as users' code sees it**: fast, isolated, and ruthless about the contract.

## When to Use

- Testing a REST/GraphQL/gRPC surface (new endpoints or whole suites).
- Schema drift between spec and implementation must be caught in CI.
- Auth flows (login, tokens, permissions, ownership) need systematic proof.
- Edge behavior (validation, conflicts, idempotency, pagination) needs coverage beyond the happy path.

**When NOT to use:**

- Implementation logic inside the service (unit tier), component wiring (integration tier), or UI re-testing of what the API already asserts.
- Designing the API contract itself — that is `arch-api-contract-design`; this skill VERIFIES it.

## Process

### Step 1 — Assert the contract, not just the status

For every case, verify the promise: **status code, response schema (against the spec/OpenAPI), error shape (code/message/field), and headers** (content-type, idempotency, rate-limit). "200" alone is a screenshot; the schema assertion is the contract check. Schema-first suites run the response through the spec validator — drift fails here, before a client discovers it.

### Step 2 — Cover the auth surface systematically

- AuthN: valid credentials, invalid credentials, expired/revoked tokens, malformed tokens, missing auth.
- AuthZ per resource: role present vs absent, and the object-level check — user A requesting user B's resource must be asserted (deny), not assumed (per `be-security-engineering`).
- Token/session lifecycle: refresh, rotation, invalidation on privilege change (where the API promises it).

### Step 3 — Edge cases from the design toolbox

Apply `tst-test-design-techniques` to the surface: valid/invalid partitions per field, boundary values (page sizes, string length caps, number ranges), decision tables for filter combinations, and state-transition walks for stateful endpoints (cancel after ship = 409/422, not 200). The API tier is where "what does the contract say for THIS input" gets pinned.

### Step 4 — Include the negative and failure shapes

- Validation: malformed payload, unknown fields (if the API promises strictness), oversized bodies.
- Conflict/concurrency: duplicate idempotency key, optimistic-lock mismatches.
- Dependencies: the API's behavior when its downstream fails (5xx from the adapter, timeout) — the surface must return its CONTRACTED error, not a naked 500 (via mocks of the seam, per `tst-integration-testing`).

### Step 5 — Run them as a fast, isolated suite

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

## Red Flags

- Assertions without schema validation (drift-friendly)
- No authZ-per-resource cases (only happy-path auth)
- Boundary/combination coverage missing on validation-heavy endpoints
- Downstream failures surfacing as naked 500s with no contracted error
- Suites depending on each other or on shared mutable state
- Contract gate not wired into CI

## Verification

- [ ] Every case asserts status + schema (+ error shape where relevant)
- [ ] AuthN variants and authZ action+resource checks systematically covered
- [ ] Partitions, boundaries, decision tables, state transitions applied to the surface
- [ ] Negative/failure shapes: validation, conflict, downstream-failure contracted responses
- [ ] Fast isolated loopback suite with deterministic seeds; CI contract gate wired pre-merge
- [ ] No "200-only" tests; no client-assumes-validation rationalization