---
name: be-microservices-patterns
description: "Selects and applies distributed-system patterns for microservices: saga and outbox for data consistency, CQRS, circuit breaker, retry with backoff, idempotent consumers, and bulkhead isolation. Use when building distributed behavior, when services share data they shouldn't, when partial failures cause cascading outages, or when choosing between patterns for cross-service transactions."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: backend
  sdlc-stage: implementation
  version: 1.0.0
---

# Microservices Patterns

## Overview

Distributed systems fail differently than monoliths: network partitions, partial success, retries that duplicate, cascading overload. This skill is the decision catalog for the classic response patterns — **saga**, **outbox**, **CQRS**, **circuit breaker**, **retry**, **idempotent consumers**, **bulkhead** — including when each is mandatory and when it is overkill. Choosing the right pattern here is an architecture decision; record it with `fnd-adr`.

## When to Use

- A business operation spans two or more services and must stay consistent.
- Services share a database that they should not share.
- Partial failures in one service pull down others (retry storms, cascades).
- Events are produced or consumed across a boundary and must not be lost or doubled.
- Choosing between patterns for a cross-service transaction.

**When NOT to use:**

- A single service with one database: sagas, outbox, and CQRS are costs, not benefits — use a local transaction.
- Synchronous calls with generous budgets that are genuinely fine: a retry policy is still needed, but a saga is not.
- Event-driven designs, but with no cross-service consistency requirement (see `be-async-messaging`).

## Process

### Step 1 — Classify the operation: local vs distributed

If the operation touches one service + one DB → local transaction, done. If it spans services or databases, you are in distributed territory: choose from Step 2–3, and never pretend a "shared database" merges the problem (it couples everything instead).

### Step 2 — Data consistency: outbox or saga

- **Transactional outbox** — the command is written in the SAME local transaction as its state change; a poller/CDC relay publishes the event. Guarantees: no lost events, no distributed transaction. Use for **every** event that must not be lost. This is close to mandatory; its absence is a bug shape ("we publish after commit and lose events").
- **Saga (choreography or orchestration)** — a multistep operation with compensating steps for failure. Choreography = events drive the flow (loose, hard to trace); orchestration = a coordinator drives it (central, traceable). Pick orchestration when the flow is business-critical and you need a single place to observe/resume it. Compensation must be written for every step that has side effects — a saga whose compensations are "TODO" is a data-corruption plan.

### Step 3 — Read/write split: CQRS when it earns it

CQRS is warranted when reads and writes have genuinely different shapes and scales (write model = domain rules, read model = projections/lookup). It is overkill for CRUD with one model. If you adopt it: the read model is eventually consistent; document the staleness rule.

### Step 4 — Failure containment: retry, circuit breaker, bulkhead

- **Retry**: for transient failures (timeouts, 429, 503) with **exponential backoff + jitter**; cap attempts; must be safe to retry — which is why idempotency (Step 5) is a precondition. Never retry 4xx or business rejections.
- **Circuit breaker**: when retries keep failing, stop trying for a cooldown to protect the dependency and the client. Configure failure threshold, cooldown, half-open probes. Without a breaker, retry storms turn a flaky dependency into a site-wide outage.
- **Bulkhead**: isolated thread/semaphore pools per dependency so one slow dependency cannot exhaust the whole service. Apply to the few highest-risk dependencies, not everything.

### Step 5 — Idempotent consumers

Every consumer must be able to receive the same message twice without corrupting state. Two enforcement layers: **deduplication by message ID** (store processed IDs for the retention window) AND **idempotent business operations** (the update is a no-op if already applied — e.g. "set status if current status is earlier in the state machine"). At-least-once delivery is the only honest assumption; exactly-once is a lie.

### Step 6 — Record the pattern choices

Write ADRs for saga/CQRS/outbox selections (`fnd-adr`): what was chosen, what was rejected, and the explicitly accepted cost (eventual consistency windows, compensation coverage). Patterns chosen silently get re-litigated at every incident.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We don't need the outbox, we'll publish after commit" | Commit-publish windows lose events on crash — the outbox is the standard fix. |
| "Exactly-once delivery is guaranteed by the broker" | Brokers give at-least-once; every consumer must be idempotent. |
| "We'll add compensation later" | Compensations written later are written from incident memory, not design. |
| "The saga is fine as choreography, it's simpler" | Traceability and resume points are the saga's real product; orchestration buys them. |
| "CQRS scales better so let's use it" | CQRS costs complexity; adopt it for shape differences, not fashion. |
| "Retrying more often fixes it" | Without a breaker and jitter, retries amplify outages. |

## Red Flags

- Multiple services sharing one database schema
- Publish-after-commit event production (loss window)
- Sagas without compensation for side-effecting steps
- Retry loops without cap, backoff, or jitter
- No circuit breaker on a dependency that has already failed through several retries
- Consumers that assume exactly-once delivery
- CQRS with no read/write shape difference

## Verification

- [ ] Operation classified: local vs distributed; shared-DB "solution" rejected
- [ ] At-least-once assumptions stated; idempotency layers in place (dedup + idempotent ops)
- [ ] Every event that must not be lost produced via transactional outbox or equivalent
- [ ] Saga: compensations exist and are tested for every side-effecting step; orchestration considered for critical flows
- [ ] Retry: capped, exponential backoff + jitter, only transient codes; breaker and bulkhead in place for hot dependencies
- [ ] Pattern selections recorded in ADRs with rejected alternatives
- [ ] Eventual-consistency windows documented where CQRS/projections apply