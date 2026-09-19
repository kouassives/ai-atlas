---
name: ops-observability
description: "Makes running systems observable: structured logging, RED/USE metrics, tracing, and dashboard layout. Use when shipping anything that runs in production, when debugging needs log greps across services, when metrics lack a coherent picture, or when latency problems need correlation across hops."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: devops
  sdlc-stage: operations-maintenance
  version: 1.0.0
---

# Observability

## Overview

Observability is the production counterpart of testing: tests ask "does it work on my machine/CI", observability answers "what is it doing right now, and why". The three signals — **logs** (events), **metrics** (aggregates), **traces** (causality) — answer different questions; a system is observable when an on-call engineer can answer "what broke, where, and why" without guessing.

## When to Use

- Shipping a new service, endpoint, or feature that will run in production.
- Debugging without observability — grepping logs across services, or "cargo-culting" a dashboard.
- A latency or reliability problem that needs correlation across hops.
- Reviewing whether the current signals would have caught last month's incident.

**When NOT to use:**

- Alerting thresholds and on-call practice — that is `ops-monitoring-alerting` (uses, but does not repeat, this).

## Process

### Step 1 — Logs: structured, correlated, useful

- **Structured** (key=value or JSON), not prose: machine-filterable without regex torture.
- Every request/flow gets a **correlation id** propagated through spans/messages (`request_id` for HTTP, message id for events) — without it, "this failed here AND there" is a research project.
- Log at the right level, at meaningful boundaries (entry/exit, decisions, failures); **never log secrets, tokens, or PII** (`be-security-engineering`).
- Logs are for events engineers search for later — a log line must carry the answer to "what happened here".

### Step 2 — Metrics: RED for requests, USE for resources

- **RED** per service: Rate, Errors, Duration (per endpoint/critical path). RED is the whole story for request-driven services.
- **USE** per resource/infra: Utilization, Saturation, Errors (CPU, memory, queues, connections). USE is the whole story for subsystems.
- Latency metrics are percentiles (p50/p95/p99) over a window, not averages. Tagged enough to slice (endpoint, status class, tenant) without exploding cardinality.
- Metrics feed dashboards AND alerting (`ops-monitoring-alerting`) — a metric nobody alerts on is a souvenir.

### Step 3 — Traces: connect the hops

- Distributed tracing (OpenTelemetry) gives the causality RED cannot: which hop ate the budget on a slow request.
- Trace every boundary that matters: HTTP in/out, DB queries, message publish/consume, external calls. Sampled tracing (head-based sampling) covers debugging without a storage explosion.
- Traces connect to logs (correlation id) and metrics (latency histograms) — the three signals reference each other.

### Step 4 — Dashboards: questions, not wallpaper

- Each dashboard answers one question for one audience (on-call: "what's breaking NOW"; capacity: "how much headroom"; product: "how healthy is the feature").
- Include the RED/USE panels + correlation id + recent errors; annotate deploys (every dashboard shows what changed behind a regression).
- Dashboard as decoration (20 panels no one reads) is noise — prune panels when they stop answering a question.

### Step 5 — Make it standard in the delivery loop

- The DoD includes observability: an endpoint's logs/metrics/trace exist before merge, not after incident #1 (`references/definition-of-done`, `ops-ci-cd` gate).
- Validate cold: exercise a failure path in staging and confirm the signal it produces (a signal that did not prove it fires is a guess).

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We'll add logging when it's in prod" | Then the first prod bug is debugged blind, at the highest stakes. |
| "Metrics: average latency looks fine" | Averages hide the p95 tail that the pager actually feels. |
| "The logs have everything in them" | Without correlation ids and structure, "everything" is unusable for a multi-hop flow. |
| "A dashboard for every metric" | Unread dashboards are the most expensive noise the team ships. |
| "OTel is too heavy for us" | Auto-instrumentation gets you most of the way with a fraction of the ceremony. |

## Red Flags

- Unstructured logs, no correlation id, secrets in log lines
- Averages-only latency; missing rate/errors on the hot path
- No tracing across a multi-hop flow (or traces not joinable to logs)
- Dashboards with panels no one can name a decision for
- Metrics with no alerting ownership
- Observability added after the incident, not before the merge

## Verification

- [ ] Structured logs with correlation ids propagated; no secrets/PII logged
- [ ] RED metrics on request paths (percentiles), USE on resources; sliced by useful tags
- [ ] Tracing at boundaries; traces joinable to logs and metrics
- [ ] Dashboards answer named questions; deploys annotated
- [ ] Observability shipped with the code (DoD), not retrofitted
- [ ] Failure paths exercised once in staging to prove the signals fire