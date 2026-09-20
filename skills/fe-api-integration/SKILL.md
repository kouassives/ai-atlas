---
name: fe-api-integration
description: "Wires UI to APIs: fetching, caching, optimistic updates, error handling, retries, and stale-while-revalidate. Use when wiring UI to APIs, when loading states are per-component chaos, when errors leave users stuck, or when refetches hammer the backend."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: frontend
  sdlc-stage: implementation
  version: 1.0.0
---

# API Integration

## Overview

The UI's job for server data is to **fetch, cache, and invalidate** — not to hold data. This skill covers the integration layer: a single cache keyed by query identity, loading/error states that are part of the data's story, retries with backoff on the right failures, optimistic updates with honest rollback, and staleness policies that keep the UI fast without lying.

## When to Use

- Wiring components to API data (lists, details, mutations, pagination, search).
- Every component has its own loading/error boolean and refetch-on-own-init.
- Errors leave the user with a spinner forever or a blank page.
- Refetching on every mount, or never refetching at all.

**When NOT to use:**

- Choosing the library (`fe-state-management` §3 sets its place; the mechanics below are library-agnostic).
- Backend contract design (`be-api-design`/`arch-api-contract-design`) — this skill consumes the contract.

## Process

### Step 1 — One cache, keyed by query identity

- Server data lives in ONE server-state cache (per `fe-state-management` §3), keyed by the full query identity (endpoint + params + auth scope) — same key, same data, no duplicate fetchers.
- Reads go through the cache; writes invalidate or update it. No component "fetches its own copy".

### Step 2 — Make loading and error part of the data story

- Every data need has three states held together — data, loading, error — returned as one unit from the hook/cache (not scattered booleans).
- Loading UX: initial load vs background refetch are different (skeleton vs subtle refresh) — the cache's stale-while-revalidate shape gives both for free.
- Errors are a state, not an exception: render a recovery path (retry button, cached fallback), never a spinner forever. The error UI carries the user's next action.

### Step 3 — Retry with discipline

- Retry transient failures (network blip, 429, 5xx) with backoff + jitter, capped attempts; never retry 4xx business rejections (`be-microservices-patterns` retry discipline applies client-side too).
- Show honest progress when a retry loop is running; auto-retry silently only for background refreshes, never for a user's action.
- Timeouts: a hanging request is a failure with a timeout, not an infinite spinner — the UI must conclude.

### Step 4 — Optimistic updates with honest rollback

- For mutations users experience as instant (likes, toggles, quick edits): apply the change to the cache immediately, fire the request, and **roll back on failure** with a clear error notice.
- Rollback restores the exact prior state; a rollback that leaves half-updated UI is worse than no optimism.
- Reserve optimism for idempotent, low-stakes mutations; destructive or cross-feature writes stay pessimistic (show progress, then confirm).

### Step 5 — Coordinate mutations with the server contract

- Mutations carry the backend's contract: idempotency keys, correct verbs/status handling, and the server's error shape surfaced to the user in terms they can act on (per `be-api-design`, `tst-api-testing`).
- Refetch/invalidate after mutations is declarative (invalidate the affected cache keys), not ad-hoc "call this component's refresh".
- Pagination and filtering use the cache's query identity so navigating back is instant instead of a refetch storm.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Each component fetches on mount, it's simple" | Simple until the fifth mount means the fifth backend hammering. |
| "A spinner until it loads is fine" | A spinner forever is a design decision that punishes the user for a timeout. |
| "Retry everything — resilience!" | Retrying a 400 is slamming the same wall with a polite backoff. |
| "Optimistic is fancy, use it everywhere" | Optimistic on a payment is how "it said OK" reports begin. |
| "Cache it so we never refetch" | Stale-forever is data lying to the user; staleness policy is the cache's contract. |

## Red Flags

- Per-component fetch/loading booleans; same query fetched twice in one screen
- Infinite spinners on error; no retry path in the error state
- Retry loops on 4xx; unordered retry storms
- Optimistic updates without rollback or on destructive writes
- Mutations that don't invalidate the cache (stale screens after "saved!")
- No timeout conclusion for hanging requests

## Verification

- [ ] Single server-state cache; queries keyed by full identity; no duplicate fetchers
- [ ] data/loading/error as one unit; skeleton vs background-refresh distinguished
- [ ] Retries: transient-only, backoff+jitter, capped; user-action failures surface honestly
- [ ] Timeouts conclude; no infinite spinners
- [ ] Optimistic only where safe, with exact rollback + error notice
- [ ] Mutations respect the contract (idempotency, error shapes) and invalidate cache keys