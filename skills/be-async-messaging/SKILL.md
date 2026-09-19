---
name: be-async-messaging
description: "Designs and maintains message and event flows: queues vs events, producer/consumer semantics, at-least-once reality, dead-lettering, ordering constraints, and replay. Use when adding messaging or events between services, when choosing between a queue and a topic, when a consumer falls behind or loses messages, or when events need to be replayed or retro-processed."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: backend
  sdlc-stage: implementation
  version: 1.0.0
---

# Async Messaging

## Overview

Messaging decouples producers from consumers — in time, in scale, and in failure. That decoupling is purchased with new failure modes: loss, duplication, reordering, and lag. This skill covers the decisions that keep a message system honest: queue vs topic selection, delivery semantics (at-least-once is the default reality), consumer lifecycles, dead-lettering, ordering, and replay. Idempotent consumers are mandatory and covered in depth by `be-microservices-patterns`.

## When to Use

- Adding messaging or events between services for the first time.
- Choosing between a queue and a topic/event stream for a flow.
- A consumer falls behind, drops messages, or loses them on restart.
- Events must be replayed or re-processed historically.
- Auditing existing message flows for the classic failure shapes.

**When NOT to use:**

- Synchronous request/response fits the flow (a call that needs the answer): reaching for a queue to "decouple" a need-answer call is over-engineering.
- Local event listeners within one process (use language-level constructs, not a broker).
- Cross-service consistency patterns (saga/outbox) — that is `be-microservices-patterns`.

## Process

### Step 1 — Pick the primitive by intent

| Need | Primitive |
|---|---|
| A task to be consumed exactly once by one worker | **Queue** |
| An event to be observed by many independent consumers | **Topic / stream** |
| Retrospective reprocessing, event sourcing, auditing | **Stream with retention + replay** |

When in doubt, prefer the stream/event shape: it preserves history, allows later consumers, and replays for free. A queue for "events others might care about later" is a history-erasing mistake.

### Step 2 — State the delivery contract honestly

Refuse the phrase "exactly-once". The honest contracts are:

- **At-most-once**: best-effort, loss accepted — acceptable only for non-critical notifications where loss is fine.
- **At-least-once**: the default. Duplicates possible; every consumer MUST be idempotent (dedup by message ID + idempotent business operation — see `be-microservices-patterns`).

Document per flow which contract applies. A flow whose consumers are not idempotent is assumed at-least-once and is a duplication bug waiting to happen.

### Step 3 — Design the consumer lifecycle

- **Poll-and-ack**: consume → process → **acknowledge only after the business work is durable**. Processing then ack prevents re-delivery exactly when it matters.
- **Reject/discard discipline**: a poison message (permanently unprocessable) must not be retried forever — after a dead-letter threshold it moves to a DLQ for inspection.
- **Retries**: transient failures retry with backoff (see `be-microservices-patterns`), NOT instant re-poll loops that burn the broker; stick to the broker's retry/DLQ machinery rather than hand-rolled sleep-retry.
- Lag monitoring: consumer lag is a first-class metric with an alert, not a surprise.

### Step 4 — Dead-letter with intent

A DLQ is not a trash can; it is an incident queue. Every dead-lettered message must be inspectable (original payload, reason, timestamp, retry count) and its handling owned by an on-call story. DLQ depth with no owner is deferred data loss.

### Step 5 — Ordering: only where it is a requirement

- Global ordering is the exception; **per-key ordering** (e.g. per `order_id`) is the common real requirement. Choose brokers/partitions that key by the ordering dimension.
- If consumers parallelize on the ordering key, they inherit ordering breaches — document the parallelism/ordering trade-off per flow.
- Never assume "the broker preserves order" for differently-keyed messages; and never assume cross-key ordering exists at all.

### Step 6 — Plan replay from day one

- Keep retention sized by the real replay window (features, audits, recovery).
- Replay must be **safe by design**: consumers idempotent (already guaranteed), and replay writes to the same pipeline with the same keys so later events do not overwrite earlier ones.
- When a replay is ordered, state the constraint to the operator — replays that reorder against live traffic create phantom inconsistency.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The broker guarantees exactly-once" | It guarantees at-least-once; exactly-once is an application myth. |
| "Messages are rare, we won't lose any" | "Rare" is the worst case for losing them — you notice in production, twice. |
| "We can just re-queue failures" | Unbounded re-queues are poison-message loops; DLQ discipline is the answer. |
| "Order doesn't matter for this flow" | Say it out loud only after checking per-key causality — it usually matters somewhere. |
| "Replay is a rare ops task" | Every incident is a replay; size retention for the incidents you will have. |

## Red Flags

- Consumers that ack before durable business work completes
- Retry loops with no dead-letter path (poison messages loop forever)
- A DLQ with no owner, no inspection UI, and no alert
- Events published to a queue where multiple future consumers are expected
- Parallel consumer pools on an ordering key
- Retention set to "as long as we can afford" with no replay plan
- "Exactly-once" anywhere in a design doc

## Verification

- [ ] Primitive chosen by intent (queue vs topic vs stream) and documented
- [ ] Delivery contract stated per flow: at-least-once default, consumers idempotent
- [ ] Ack-after-durable-process; retry via broker machinery; poison → DLQ after threshold
- [ ] DLQ owned: inspectable, reason+payload kept, alert on depth, handling story
- [ ] Ordering requirement declared per flow; keyed parallelization matches it
- [ ] Replay plan: retention window sized, replay safe by idempotency, ordering constraint documented
- [ ] Consumer lag monitored and alerted