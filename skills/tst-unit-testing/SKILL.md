---
name: tst-unit-testing
description: "Writes unit tests that stay fast and honest: isolation, naming conventions, mocking do's and don'ts, and coverage discipline. Use when writing unit tests, when unit tests are slow or over-mocked, when suites assert implementation details, or when coverage is gamed instead of meaningful."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: tester
  sdlc-stage: testing
  version: 1.0.0
---

# Unit Testing

## Overview

Unit tests are the pyramid's base: thousands of tests, milliseconds each, isolating one unit of logic. Their discipline is **isolation and honesty** — fast, deterministic, behavior-asserting, and immune to the two classic diseases: the over-mocked suite that proves a fiction, and the detail-coupled suite that breaks on every refactor.

## When to Use

- Writing or improving unit tests for logic (domain rules, calculators, validators, reducers).
- Unit tests are slow, order-dependent, or need 50 mocks per test.
- A suite that was "green" broke during a rename — detail-coupled tests.
- Coverage is high on paper but the tests assert nothing about behavior.

**When NOT to use:**

- The RED-GREEN-REFACTOR loop of writing them first — that is `be-tdd`.
- Testing the wiring of components together (real collaborators) — that is `tst-integration-testing`.

## Process

### Step 1 — Test one unit, one behavior, one assertion family

- The unit under test = the smallest meaningful behavior (a function, a rule, a method), driven through its public surface.
- One behavior per test; assert the OUTCOME (return value, exception, state change), not the journey. A test that asserts "methodA called methodB with X" tests the plumbing, not the behavior.

### Step 2 — Name tests as specifications

`describe/it` (or equivalent) reads as a sentence: `it rejects an order with no items`, `it applies the senior discount only to members over 60`. Names that read like behavior survive refactors; names that read like methods die with them. The suite is the executable part of the documentation (`fnd-technical-writing`).

### Step 3 — Isolate for speed and determinism, not for comfort

- Stake out the REAL boundaries: time (inject clock), randomness, external I/O (HTTP, queues, files), and global state.
- Prefer **constructing minimal real collaborators** (a real small value object, a plain function) over mocking them; mock only what you cannot construct cheaply and deterministically.
- Never mock the unit itself, its language primitives, or the framework behavior (a mock that encodes "the library works" asserts nothing you own).
- The golden test is dependency-light and assertion-rich; if a test needs ten mocks, the unit's seams are wrong (`be-solid-principles`, `be-refactoring`).

### Step 4 — Coverage with a conscience

- Coverage is a probing tool: the line you never hit is the branch you never thought about. Use the report to find untested branches, then decide deliberately.
- **Stop gaming coverage**: no coverage pragmas to silence a number, no test that calls a function just to color a line green. Coverage is the map, not the journey.

### Step 5 — Keep the suite fast and parallel

- Thousands of tests in seconds is the norm: no network, no sleeps, no shared filesystem state; parallel-safe by construction (no shared mutable global).
- A unit test that sleeps on a timeout is a slow integration test wearing a unit costume — fix the seam, not the setTimeout.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Mock everything so tests are isolated" | Isolation is determinism at real seams, not a mock party; wealth of mocks = poverty of truth. |
| "We assert the internal call to be safe" | Detail-asserting tests break on every refactor and then get deleted — the net evaporates. |
| "100% coverage is the goal" | 100% with no behavioral assertion is the most expensive lie a suite can tell. |
| "Sleeping 2s makes the test more realistic" | It makes it slow and flaky; realism belongs to the integration tier. |
| "One assert per test is dogmatic" | It is about one BEHAVIOR, and behavior families are fine — assert the outcome as a family, not the calls. |

## Red Flags

- Tests tied to method calls/internal implementation; break on rename
- Mocks for in-house code with real logic (`be-tdd` §6)
- Slow unit tests: sleeps, network, shared global state
- Coverage dressed up (pragmas, call-for-the-line tests)
- Assertions that never check the outcome family (no throws, no state)
- Tests that only pass in a specific order

## Verification

- [ ] One behavior per test; asserts outcomes through the public surface
- [ ] Names read as specifications
- [ ] Mocks only at real seams; minimal real collaborators preferred
- [ ] No mocks of the unit itself/language/framework behavior
- [ ] Coverage used to find untested branches; not gamed, no silencing pragmas
- [ ] Suite fast (< seconds), deterministic, parallel-safe