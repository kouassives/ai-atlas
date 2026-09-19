---
name: be-tdd
description: "Drives implementation and bug fixes with test-driven development: Red-Green-Refactor, the test pyramid (80/15/5), test sizes, DAMP over DRY, and what not to mock. Use when implementing logic or fixing bugs, when code has no tests, when a bug needs a regression test first, or when test suites are slow, brittle, or testing the wrong layer."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: backend
  sdlc-stage: testing
  version: 1.0.0
---

# Test-Driven Development

## Overview

TDD is a design discipline wearing a testing costume: writing the failing test first forces the API into existence, keeps the design minimal, and produces a regression net for free. Beyond the loop, this skill covers the test pyramid and test sizes, the readability principle (DAMP over DRY), and the mocking discipline that keeps suites fast and honest.

## When to Use

- Implementing new logic or a feature with real behavior.
- Fixing a bug: write the regression test that reproduces it FIRST, watch it fail, then fix.
- Code exists with no tests — add the safety net incrementally around changes.
- Suites are slow, brittle, or assert implementation details.

**When NOT to use:**

- Writing tests for pure plumbing with no logic (a getter, a config read) — the pyramid's base is not all code, it's all behavior.
- Test strategy design across a whole system (that is `tst-` domain).
- UI/composable testing has its own rules in the `fe-`/`ui-` domains.

## Process

### Step 1 — Write the failing test first (Red)

- Name the behavior, not the method: `it rejects an order with no items` beats `testValidateOrder`.
- One behavior per test; act through the **public API** of the unit — never reach into internals just to "be faster".
- The test must fail for the RIGHT reason (behavior missing), not a compile error or a fixture bug. A test that fails before it would have passed anyway is not a Red.

### Step 2 — Make it pass in the minimal honest way (Green)

- Implement the simplest thing that satisfies the test. Resist the temptation to build the "complete" design — YAGNI (`fnd-engineering-principles`).
- If the test needs refactoring to be honest (wrong assertions, test-only branches in prod code: `if (test) { js }`), fix the test — that branch is a smell, not a shortcut.

### Step 3 — Refactor under the green net

- Improve the design while the tests prove behavior is preserved.
- This is when the SOLID shape emerges (`be-solid-principles`): extract, rename, restructure — the net catches wholesale moves.
- If refactoring requires touching test assertions, the tests were coupled to shape; loosen them (they should assert behavior, not calls).

### Step 4 — Shape the suite with the pyramid (80/15/5)

- **~80% unit tests**: fastest, one unit with mocks at its boundaries.
- **~15% integration tests**: real collaborators at the seams (DB via a real test instance, HTTP via real loopback) — this is where contract and SQL bugs actually live.
- **~5% end-to-end tests**: the thinnest smoke layer over the real deployed shape.
- The ratio is a guardrail, not a ruler: the category that keeps growing while bugs escape is where the next test goes.

### Step 5 — Keep tests readable: DAMP over DRY

- Tests read as **specifications**: descriptive names, arrange-act-assert visible, small inline fixtures where clarity wins.
- DRY up only the expensive/noisy mechanics (connection setup, factories) — never the behavior narrative. A test whose meaning requires three helper walk-throughs is documentation debt.

### Step 6 — Mock the boundary, not the behavior

Mock **nowhere you can avoid**: mock external seams (HTTP, clock, queues, randomness, persistence you don't own) so the unit is fast and deterministic. Do NOT mock:
- the unit under test's collaborators you own and that hold logic — use real ones (integration) or you test a fiction;
- the framework primitives you wrap (the wrapper is yours; the browser/DB/sdk behavior is theirs).

If a mock is carrying assertion logic, it has become a parallel implementation — the test proves nothing.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll write the tests after, it's faster" | Tests written after are written from the tunnel of the completed implementation — they bless the shape instead of steering it. |
| "This is UI/glue code, TDD doesn't apply" | Apply it to anything with branching; the thin glue stays thin because the branch logic was extracted to be testable. |
| "Mocking everything makes the tests fast" | It makes them fiction. Wealth of mocks = poverty of truth. |
| "The pyramid is old-fashioned" | The ratio is the empirical result of wasted e2e suites; the shape survives the trend cycle. |
| "The test suite is too slow, we skip it" | Slow tests are a debt symptom — classify by size and shrink the slow tiers, don't abandon the net. |

## Red Flags

- Tests asserting implementation details (method calls, internal fields) instead of behavior
- A test written after the fix that would have passed before it
- `if (test)` branches or args in production code
- Mocks for in-house collaborators with real logic
- 100% unit tests and zero integration (the confident-but-wrong suite)
- Entirely e2e-heavy suites (the slow-and-flaky suite)

## Verification

- [ ] Failing test written first and failed for the right reason (for new behavior or the bug's regression)
- [ ] Minimal honest implementation; no test-only prod branches
- [ ] Refactor performed under a green net with behavior-assertions intact
- [ ] Suite shaped toward the pyramid; each new test sized at its right tier
- [ ] Tests read as specs (DAMP); only mechanics DRYed
- [ ] Mocks only at external seams; no parallel-implementation mocks
- [ ] Suite run green and reasonably fast; no skipped/silenced tiers