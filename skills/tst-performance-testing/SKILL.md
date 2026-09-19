---
name: tst-performance-testing
description: "Validates performance requirements: load, stress, soak tests, benchmarks, and bottleneck analysis. Use when performance requirements need evidence, when a load model must be translated into tests, or when capacity limits and degradation points need to be known before they bite in production."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: tester
  sdlc-stage: testing
  version: 1.0.0
---

# Performance Testing

## Overview

Performance testing turns the NFRs from `arch-nfrs` into evidence: load tests prove normal operation, stress tests find the breaking point, soak tests catch the slow leaks, and benchmarks pin the regressions. Its discipline is **the load model** — performance tests against made-up traffic prove nothing about the traffic you actually have. The output is the capacity map: what works, where it degrades, and what breaks first.

## When to Use

- A performance requirement (latency budget, throughput, capacity) needs verification.
- The team needs to know the breaking point before a launch, campaign, or scale event.
- Slow regressions (leaks, growth) need a soak story.
- Choosing between two implementations and needing a benchmark's evidence.

**When NOT to use:**

- Diagnosing a single slow request in production — that is `be-performance`. This skill DESIGNs the test programs that PROVE the requirements.

## Process

### Step 1 — Build the load model from reality, not imagination

- The model = the real traffic shape: request mix (endpoint ratios), concurrency, arrival pattern (steady vs burst), data volume reality (row counts, user counts), and growth.
- Sources: production metrics/logs if they exist; product estimates as the honest fallback (with the uncertainty named).
- Every test's parameters trace to the model: users, think times, payload sizes, ramp shape. Load without a model is a lottery ticket.

### Step 2 — Load test: prove the target

- Configure for the SLO's load (e.g. 2× expected peak) and the SLO's percentile (p95/p99), measured at the tier the NFR names (API, service, journey).
- Ramp to reveal instability — sudden full-load is a stampede the model never generates.
- Result = evidence against the budget: pass/fail per percentile WITH the measurement conditions. "It felt fine" is not a result.

### Step 3 — Stress and failure tests: find the edge

- **Stress**: push past the target until the system degrades or fails — the content of the test is WHERE it breaks (which resource saturates first: CPU, connections, DB, queue).
- **Failure-inject**: kill a dependency mid-load (chaos-style, bounded) — does it degrade gracefully per contract or collapse?
- Both outputs are the capacity map: known limits beat surprise limits.

### Step 4 — Soak: catch the slow rot

- Sustained load over hours/days at realistic levels: memory leaks, connection leaks, unbounded queues, temp growth (`be-performance` hunting grounds).
- Soak's metric set: memory/connection/fd trends and monotonically creeping latencies — the slow death signature.

### Step 5 — Benchmarks for decisions, in isolation

- When comparing two designs/libraries: benchmark the specific decision (the hot path), on realistic data shapes, minimizing noise (same machine, warmup, repeated runs).
- A benchmark with no decision attached is a souvenir; a benchmark whose decision is "everything" proves nothing.

### Step 6 — Report the capacity map

The deliverable: per test — model, parameters, results against each target, observed limits, and the first-saturation point. The map lives with the service (docs/ADR-level), because capacity knowledge decays weekly as data grows; re-run on major changes and schedule the soak/stress cadence.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We'll use a public load-test tool default" | Default traffic is invented traffic; the model is the whole game. |
| "Fire all users at once, it's more realistic" | Real systems ramp; all-at-once tests the failure to start, not the steady state. |
| "p50 looks great, ship it" | p50 hides the tail the SLA quotes — test what the NFR promises. |
| "Stress tests break things, skip them" | Breaking it in the lab is the gift; breaking it in production is the incident. |
| "Soak is for big enterprises" | Soak is for anything that runs long — leaks are not a size question. |

## Red Flags

- Load parameters not traceable to a model (invented traffic)
- Only average latency asserted; target percentiles unmeasured
- No ramp, no stress, no failure-inject → the capacity map is a guess
- No soak on long-running services → leaks discovered by the pager
- Benchmarks without a decision or with noisy methodology
- Results reported without conditions (load, concurrency, environment)

## Verification

- [ ] Load model built from metrics/estimates; every parameter traced to it
- [ ] Load test proves the SLO at its target load and percentile, with conditions reported
- [ ] Stress + failure-inject found the edge: first point of saturation identified
- [ ] Soak run where long-running: leaks/creep trends reported
- [ ] Benchmarks decision-attached, isolated, methodology clean
- [ ] Capacity map delivered and re-run on major changes