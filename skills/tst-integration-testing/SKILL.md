---
name: tst-integration-testing
description: "Tests components wired together: contract testing, database and service integration, and testcontainers. Use when wiring components together, when unit tests are green but the system fails at seams, when SQL, messaging, or external adapters need real verification, or when contracts between services need protection."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: tester
  sdlc-stage: testing
  version: 1.0.0
---

# Integration Testing

## Overview

Integration tests live in the missing middle of the pyramid: they wire real collaborators at the seams — the database, the message broker, the external adapter — and verify what unit tests cannot: that the pieces agree on reality. Their discipline is **realism at the seam, speed by construction**: real DB behavior via lightweight real instances (testcontainers/embedded), real contracts via contract tests, and no test that needs the whole production stack to answer a seam question.

## When to Use

- The repository/query layer against a real database (schema, SQL, transactions, isolation).
- Messaging: publish/consume against a real broker (or its real compatible container).
- Service-to-service contracts that must not silently drift (`arch-api-contract-design`).
- After unit tests are green, before e2e: the seam is where the wiring bugs live.

**When NOT to use:**

- Pure logic (unit tier). Testing the entire stack end-to-end (e2e tier — usually slower and flakier than warranted).

## Process

### Step 1 — Give each seam a real, disposable partner

- **Database**: use testcontainers/embedded real engines (real SQL semantics, real constraints, real transaction isolation) — not your production DB, and not an in-memory fake pretending to be Postgres. The in-memory fake has different SQL and different locks; it validates a fiction.
- **Broker/queue**: real broker container; for event schemas, the same image the environment uses.
- **HTTP adapters**: loopback servers with scripted responses, or wiremock-style doubles for external APIs — the HTTP semantics stay real.

### Step 2 — Drive through the real boundary, assert on observable state

- Call the repository/consumer/adapter exactly as production code does; assert on what the system would observe (row persisted, message consumed, parsed response), not on mock call counts.
- Deterministic: fresh isolated database per run (transaction rollback or container-per-suite); no cross-test state bleed. Parallel-safe or serialized, never both at random.

### Step 3 — Verify contracts as their own artifact

- Contract tests (provider/consumer style) pin the agreed payloads and semantics: the producer's tests confirm it still satisfies the contract; the consumer's tests confirm it uses only what the contract grants (`arch-api-contract-design` §6).
- Contract drift is a CI failure on BOTH sides — the graceful-degradation fiction ("we'll just add a field") is how consumers break silently.

### Step 4 — Also test the failure shapes at the seam

The seam is where failures are real: DB unavailable at startup (backoff), constraint violation handling, retry-on-transient, timeout behavior. At least one negative integration test per seam (connection refused, malformed response from the double) — this is the tier where `be-microservices-patterns` failure behavior gets proven.

### Step 5 — Mind the speed budget

- Integration tests are the 15% of the pyramid with the 15% of the time: container startup amortized, suites grouped, and everything still under minutes.
- If integration tests need the full stack, staging, live external systems — that is a design smell (the seams are not isolated enough); pull the real boundary inward.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Our in-memory fake is basically the same DB" | Fakes have different SQL, different locks, different isolation — they pass, prod fails. |
| "Contract tests are too much ceremony" | They are the only thing that makes both teams sure the payloads still agree. |
| "We test the happy path, the DB is always up" | The DB is up until the day it is not — seam failures are integration-tier by right. |
| "One integration test that boots everything is enough" | That is an e2e test with an integration label; it is slow AND it blurs the seam. |
| "Real containers make CI slow" | Amortized container setups keep it in minutes; the alternative is "works locally" mysteries. |

## Red Flags

- In-memory fakes standing in for the real database/broker
- Contract drift caught by incident instead of CI
- No negative seam tests (retry, timeout, refused connection)
- Integration tests sharing state, depending on order, or hitting staging
- E2E-shaped tests wearing an integration tag
- Seams not isolated enough to be tested independently

## Verification

- [ ] Real seam partners (testcontainers/real engines); no in-memory DB fakes
- [ ] Tests drive the real boundary and assert observable state
- [ ] Contract tests on service boundaries; drift fails CI on both sides
- [ ] Failure shapes covered per seam (retry, timeout, refused connection, constraint)
- [ ] Isolation: fresh state per run, parallel-safe, deterministic
- [ ] Runtime budget in minutes, amortized setup; no full-stack dependency