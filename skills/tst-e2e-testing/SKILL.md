---
name: tst-e2e-testing
description: "Tests critical user journeys end-to-end: Playwright/Cypress patterns, journey selection, and stability against flake. Use when proving critical paths through the real stack, when e2e suites are flaky or huge, or when a release gate needs evidence that the core journey works."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: tester
  sdlc-stage: testing
  version: 1.0.0
---

# E2E Testing

## Overview

E2E tests prove the critical journey through the real stack — browser through API to database. They are the pyramid's thin, precious tip: most valuable per test, most expensive per test, and most prone to rot (flakiness, travel time, brittle selectors). Their discipline is **few, journey-shaped, and boring**: a tiny fleet of tests that are so stable and fast the team trusts them as the final gate.

## When to Use

- Proving the 1-3 journeys that make or break the product (signup→pay, cart→checkout, login→admin).
- A release gate needs evidence that the core journey works in the real shape.
- E2E suites grew to hundreds and now flake cost more than they catch.

**When NOT to use:**

- Covering every page's variations (integration/unit territory — see `tst-integration-testing`).
- Testing what lower tiers already price — e2e is for the LAST mile of wiring, not for re-testing rules.
- First proof of logic — that is `be-tdd`; e2e is evidence, not development loop.

## Process

### Step 1 — Choose journeys, not pages

A journey is a user's whole trip (browse → add → checkout → order confirmation), not a page. Select by value and risk (`tst-test-strategy`): the journeys whose failure means the product is failing. The whole e2e fleet should fit in a handful of journeys; if it doesn't, page-level coverage is leaking in from the wrong tier.

### Step 2 — Write journeys as user stories with explicit setup

- Arrange: deterministic seed data (the journey's fixture — created via the app's APIs, not by clicking through the UI to get there).
- Act: the user's real actions (real selectors from user-visible roles/text, not brittle CSS paths frozen from an old build).
- Assert: the observable outcome (confirmation screen, DB row, email for critical paths).
- The journey is told in `tst-test-design-techniques` shape (Given/When/Then) — same discipline, real stack.

### Step 3 — Control the environment like a laboratory

- Dedicated environment (or isolated container) with **known seed state**; never run e2e against shared prod-like data or live third-party services (stub the external payments in AND note the seam, `tst-integration-testing`).
- Deterministic clock/data wherever the journey displays time or relative dates — flake loves "today" and random.

### Step 4 — Engineer out the flake

Flake is the #1 killer of e2e trust — treat it as a bug (`tst-regression`), never mask it:

- **Wait on conditions, not on sleeps**: wait for the UI state the journey needs (element/network idle), never `setTimeout` rituals.
- **Retry policy**: built-in test-runner retries ONLY for infrastructure flake, never to paper over a real bug; a consistently retried test is a failing test in disguise.
- **Selectors**: by role/text/label (user-visible contract identifiers), not by capture-once CSS. A test that breaks on every restyle was testing the restyle.
- **Isolation**: each journey independent — a failing journey must not poison the next (fresh state per test).

### Step 5 — Keep the fleet tiny and the gate meaningful

- E2E in CI on the release gate (or nightly + pre-release), not on every commit; the dialect is "few + trusted", the enemy is "many + flaky".
- Track the fleet's flake rate; flake above ~1% is a debt emergency, not a nuisance.
- The gate's evidence is the output: which journey ran, which step failed, with the trace/artifact — a journey failure with no artifact failed the tooling, not the product.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "E2E everything — it's the real test" | An e2e-everything suite is slow, flaky, and late; it re-tests what lower tiers priced. |
| "setTimeout(2000) and hope" | Sleeps are flake factories; wait on conditions. |
| "Selector copied from DevTools" | Copies from DevTools break on the first restyle; user-visible identity survives. |
| "One flaky test, just retry it" | A retried test is a lie the suite tells the release gate. |
| "Run e2e against staging/prod data" | Shared data = shared flake; the laboratory has its own seeds. |

## Red Flags

- Hundreds of e2e tests covering pages, not journeys
- Sleeps, capture-once selectors, tests that retry to pass
- E2E against live third parties or shared staging data
- Flake rate trending up, unowned
- Journey fixtures built by clicking through the UI
- Failures with no artifacts

## Verification

- [ ] Fleet = few critical journeys (handful max), value+risk selected
- [ ] Given/When/Then journeys with deterministic seed state
- [ ] Laboratory environment: dedicated, seeded, external seams stubbed deliberately
- [ ] Condition waits, no sleeps; selectors user-visible; journeys isolated
- [ ] Gate placement right (release/nightly); flake tracked, debt owned
- [ ] Failure artifacts complete; flaky tests treated as bugs, not retried