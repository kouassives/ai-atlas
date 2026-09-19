---
name: tst-regression
description: "Designs and manages regression suites: selection and prioritization, change-linked execution, and flaky-test management. Use after changes or before releases, when a regression escapes to production, or when the suite is slow or flaky and trust is eroding."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: tester
  sdlc-stage: operations-maintenance
  version: 1.0.0
---

# Regression Testing

## Overview

Regression testing is the net that catches what a change moved when nobody was looking. Its three problems are scale (a full suite grows past the budget), selection (which tests protect THIS change), and trust (flakes that make the net unreliable — which is worse than no net, because green lies). This skill covers suite design, change-linked execution, prioritization, and the discipline that keeps flakes from rotting the net.

## When to Use

- After a change or before a release: choose what regression protection runs now.
- A regression escaped to production ("the tests were green").
- The suite is slow, huge, or flaky and nobody trusts it.
- A flaky test is being retried instead of fixed.

**When NOT to use:**

- Writing the tests themselves (the `tst-*`/`be-tdd` skills build them). This skill SELECTS, SCHEDULES, and MAINTAINS them.

## Process

### Step 1 — Build the suite as a protection map

Each test/group carries its protection label: which behavior, which risk (`tst-test-strategy`), which criticality. The map is what selection runs on — without labels, every change runs "all the tests" (slow) or "some tests" (blind).

### Step 2 — Select by change, not by habit

- For each change, run: the **directly affected** tests (unit), the **seams touched** (integration), the **journeys** that cross the change (e2e), plus a **safety baseline** (fast smoke of the critical path).
- A minimal full-suite cadence (nightly or pre-release) catches the interactions selection deliberately skips between releases.
- Selection is a policy with owners — "run everything for any change" is a selection policy, it's just usually the wrong one.

### Step 3 — Prioritize by risk and cost

- When the full suite can't run everywhere, order by: protects-a-past-incident, hits the changed code, critical-journey labeling, and suite cost. Past-incident tests outrank decorative breadth — they are the ones paid for with real outages.
- **Every regression that escapes becomes a test**: the fix for the incident includes the test that would have caught it (this is the incident-loop of `tst-test-strategy` made concrete).

### Step 4 — Treat flake as the top debt

- Flake is a bug in the test or the infrastructure, NOT a weather event. Roll it into the team's backlog with an owner.
- "Retry-till-green" is banned as a pass condition: a test that needs retries to pass is failing, and the retry hides it. Runner-level retry for genuine infra blips is a bounded exception with visibility, never a blanket.
- Track the flake rate per suite; >~1% is an emergency for the release gate's credibility.

### Step 5 — Make the suite fast enough to be run

- Slow tests migrate down a tier where possible (e2e-shaped logic → integration → unit) — the regression mapping then protects more with less time (`tst-e2e-testing` §5, `tst-unit-testing` §5).
- Parallelize by isolation; keep the baseline smoke under a few minutes so the safety baseline actually runs.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Run the whole suite on every PR" | A suite so big it can't run selectively won't stay run at all — selection is saving it, not cutting it. |
| "The test passed on retry, so it's fine" | A retried-to-green test is a lie the suite tells; flake is the debt. |
| "That test has always been flaky" | "Always flaky" = unowned debt with an incident in its future. |
| "We don't need the incident test, we fixed the cause" | The cause is today's; the test is tomorrow's survival of the next refactor. |
| "Selection is too complicated, just run all" | All-or-nothing is a selection policy with the worst cost/risk curve. |

## Red Flags

- Flaky tests retried into green; flake rate unmeasured/unowned
- Regression escapes with no test added from the incident
- Selection absent (always "all" or always "some" with no reasoning)
- Past-incident tests unprotected or removed (the expensive lessons deleted)
- Snowballing suite with no tier migration (e2e-shaped tests everywhere)
- Green suite that production contradicts — trust hole

## Verification

- [ ] Protection map labels exist (behavior/risk/criticality) and are maintained
- [ ] Selection policy: affected tests + touched seams + crossing journeys + fast baseline; full-suite cadence defined
- [ ] Prioritization risk-and-cost ordered; incident regressions have their tests
- [ ] Flakes owned as backlog debt, never retried-to-green blindly; rate tracked
- [ ] Suite speed budgeted; slow tests migrated down tiers
- [ ] Escaping regression loop: every escape becomes a test