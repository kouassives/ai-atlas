---
name: arch-microservices-architecture
description: "Decides service decomposition: how to split or consolidate services, bounded-context-aligned boundaries, data ownership, and when NOT to use microservices at all. Use when splitting a monolith, when services have unclear ownership or shared databases, or when the team is considering microservices and needs an honest decomposition analysis."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: architect
  sdlc-stage: design
  version: 1.0.0
---

# Microservices Architecture

## Overview

Microservices are a **boundary technology**: they enforce ownership, team independence, and isolated scaling — and they charge in operational complexity, latency, and distributed failure modes (the pattern catalog in `be-microservices-patterns` is the tax you then pay). This skill is the decomposition discipline: WHEN a service split earns its cost, how to find the boundaries (bounded contexts first), and how to declare data ownership so services stop sharing state.

## When to Use

- Splitting a monolith into services — or **consolidating** services that were split too eagerly.
- Services share databases, models, or deployment cycles and the coupling is painful.
- The team needs a decomposition proposal with boundaries, ownership, and the honest when-NOT case.
- Volunteers for the "just add another service" reflex.

**When NOT to use:**

- The system is one team, one deployable, moderate scale — a modular monolith earns the same boundaries at a tenth of the operational cost.
- Scaling is the only motivation: scaling is about bottlenecks and data, solved first by modules, caches, and queues (`be-performance`).
- A service has been proposed with no owner, no data boundary, and no failure analysis — that is a deployment unit, not a microservice.

## Process

### Step 1 — Ask the motivation question honestly

Concrete, non-marketing reasons to split: independent deploy cadence, independent scaling of a hot component, team ownership/boundary alignment, failure isolation. Reasons that are NOT sufficient alone: "modules are hard", "everyone else does it", "the monolith is scary". If the honest answer is "deploy independence for one hot module", that is ONE service — not twenty.

### Step 2 — Find boundaries with bounded contexts, not table ownership

Decompose by **bounded contexts** (`arch-ddd`), not by tables, layers, or JSON size:
- Which contexts have their own vocabulary and rules? Those are service candidates.
- Which business flows cross contexts? Those crossings become **contracts** (APIs/events), not shared state.
- **Never** split the same context across services — that converts a language boundary into a distributed transaction, which is the worst of both worlds.

### Step 3 — Declare data ownership per service

For each candidate service, one line: "X owns these data, exclusively; everyone else reads/writes X's data only through X's contract." A service whose data is read directly or whose tables are written by others does not exist — it is a facade. The shared-database "compromise" is the single most reliable way to get distributed coupling without distributed benefits.

### Step 4 — Map the flows and their failure surfaces

For every cross-service flow: synchronous calls become latencies; asynchronous crossings become consistency windows (`be-async-messaging`, `be-microservices-patterns` for saga/outbox/circuit breakers). If a critical flow now requires three services and two consistency windows, that flow must justify its split in the trade-off record — otherwise keep it in one service even if the context boundary suggests otherwise.

### Step 5 — Prefer the modular monolith default

When the honest motivation does not pass Step 1–4 fully: propose the **modular monolith** — the same bounded-context boundaries, the same modules/ownership in one deployable, safe local transactions, cheap refactors. The service boundaries drawn in the modular monolith are exactly the seams you would need to split later — and they are where a FUTURE, evidence-driven split starts, instead of a fashion-driven one.

### Step 6 — Record the decomposition as an ADR

Write the split (or the deliberate non-split) as an ADR (`fnd-adr`): motivation, the boundaries chosen/rejected, data ownership table, and the accepted costs. Decomposition decisions without records get re-litigated at every outage; with a record, re-litigation is cheap and evidence-based.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Shared DB is fine, it's just reads" | Direct reads are ownership violations; the report you saved months ago later takes your read model hostage. |
| "We'll split the monolith into 10 services" | First split by honest motivation, then by contexts; ten eager services = ten sagas to maintain. |
| "Microservices scale better" | Scaling is about the bottleneck; a well-moduled monolith scales with replicas until a real independent bottleneck appears. |
| "Each service makes the team independent" | Independence is a boundary property, not a physical one; shared owners and shared DBs follow every weak boundary. |
| "We can always merge later" | Merging services is a multi-team, multi-deployment project — the most expensive redo there is. |

## Red Flags

- Services with no exclusive data ownership (shared DBs, direct cross-service reads)
- Decomposition by layers/tables instead of bounded contexts
- A context split across services, forcing distributed transactions
- Critical flows demanding more consistency windows than their value justifies
- Splits driven by "monolith is hard" with no named bottleneck
- No ADR recording the boundaries, ownership, and accepted costs

## Verification

- [ ] Honest motivation stated; non-reasons explicitly rejected
- [ ] Boundaries from bounded contexts; no context split across services
- [ ] Data ownership line per service; no shared databases or direct reads
- [ ] Cross-service flows mapped; consistency windows counted and justified
- [ ] Modular monolith considered as the default; rejection reason recorded
- [ ] ADR written with boundaries, ownership table, and accepted costs
- [ ] Split count justified by motivations, not by fashion