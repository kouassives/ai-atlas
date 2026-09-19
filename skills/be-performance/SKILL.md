---
name: be-performance
description: "Diagnoses and fixes performance issues: profiling before optimizing, caching strategies, N+1 query detection, connection pooling, and latency budgets. Use when performance matters or regresses, when a request or query is slow, when load tests fail, or when someone proposes a cache or a micro-optimization without measurement."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: backend
  sdlc-stage: implementation
  version: 1.0.0
---

# Performance

## Overview

Performance work fails in two opposite ways: unmeasured guessing ("let's add a cache") and unbounded perfectionism. Both yield the same outcome — complexity with no measured win. This skill enforces the evidence loop: budget → baseline → profile → fix → verify → keep. The two recurring structural causes in backend work — N+1 queries and connection exhaustion — are covered explicitly.

## When to Use

- A request, query, or flow is slower than its budget or regressed.
- Load/stress tests fail latency or throughput targets.
- Someone proposes a cache, an index, an async rewrite, or a micro-optimization — before accepting, run the loop.
- Capacity planning or latency budget review for an endpoint.

**When NOT to use:**

- Premature optimization in features with no performance requirement — YAGNI wins (`fnd-engineering-principles`).
- Database schema/index design itself (that is `be-database-design`); this skill uses its evidence, it does not redo it.

## Process

### Step 1 — Set the budget and the measurement

Every performance task starts with a number, not a feeling: **latency budget** (p50/p95/p99) and **throughput requirement**, per endpoint or flow. If no budget exists, the measurement target is "find the dominant cost and eliminate it without changing behavior." Baseline it before touching anything — the baseline is the only honest control.

### Step 2 — Profile before optimizing

- Trace the request end-to-end: where does the time actually go (DB? serialization? external calls? GC? queues)?
- Profiler/tracer output beats intuition — record the top 3 costs with percentages before proposing a fix.
- Rule: **no change without a plan that shows the measured dominant cost.** A cache for a path that is DB-bound but caching the wrong layer moves nothing.

### Step 3 — Hunt the two structural causes first

- **N+1 queries**: the ORM fires one query per row of a lazily-loaded relation. Detection: query logs/explain, latency proportional to row count. Fix: eager loading/joins/batched IN-queries. This is the single most common backend regression — check it before any cache discussion.
- **Connection/resource exhaustion**: connection pools sized below concurrent need, connections held during slow external calls or long transactions, leaked pools. Fix: bound pool to DB capacity, release promptly, never run external calls inside a DB transaction holding a pooled connection.

### Step 4 — Caching: last resort with a discipline

Only after the query/design is already correct and still too slow:

- Cache **read-mostly, eventually-tolerant** data — never a cache for data whose staleness is unacceptable without an explicit invalidation story.
- Design the key (content-addressable or normalized), the TTL (documented staleness window), the size bound, and the **invalidation path** (write-through/TTL/versioned key) — a cache with no invalidation plan is a correctness bug scheduled for later.
- **Cache stampede protection**: single-flight/coalescing for recomputation; jitter TTLs; rate-limit recompute.
- Measure the hit-ratio and latency effect after shipping. A cache that doesn't measurably help gets removed.

### Step 5 — Fix and verify the same loop you started

- Re-run the exact same measurement after the change; report before/after on the same metric (p95, throughput).
- If the measured dominant cost did not move, the change did not do what the profile claimed — investigate, do not "call it close enough."
- Watch the downstream: slower-but-load-balanced, faster-but-inconsistent, quicker-but-more-connections: performance is a portfolio, not a single metric.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It's slow, add a cache" | 80% of backend slowness is N+1 or connection patterns; a cache hides both at the cost of correctness risk. |
| "Micro-optimizations add up" | They add up only when measured; unmeasured micro-opts are complexity with a placebo. |
| "The profiler doesn't matter, I know the cause" | Profiling is how "I was sure it was X" turns out to be Y — redirect the same energy into two minutes of tracing. |
| "Cache TTL of 5 minutes is fine" | Only if staleness <= 5 minutes is acceptable to every reader — document it, or it fails in an audit someday. |
| "It's faster on my machine" | Single-client local speed is not latency under concurrency — load-test the real shape. |

## Red Flags

- An optimization proposed with no baseline measurement
- Query count growing with list size (N+1 signature)
- Caches with no invalidation path or no hit-ratio measurement
- Connection pools sized to guesses, or external calls inside transactions
- Optimizations that change behavior silently (stale reads, dropped work) to "gain" speed
- Before/after numbers on different metrics or different code paths

## Verification

- [ ] Latency/throughput budget stated and baselined before changes
- [ ] Dominant cost identified by profile/trace (top 3, with percentages)
- [ ] N+1 and connection exhaustion checked and resolved before any cache talk
- [ ] Any cache: key, TTL with documented staleness, size bound, invalidation path, stampede protection
- [ ] Before/after measured on the SAME metric and code path
- [ ] No behavior change beyond the performance intent; caching correctness documented
- [ ] Unhelpful caches removed, not retained out of sunk cost