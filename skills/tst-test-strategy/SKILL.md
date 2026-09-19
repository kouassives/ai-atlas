---
name: tst-test-strategy
description: "Plans a testing approach: test pyramid and quadrants, risk-based scoping, coverage goals, and what to automate versus not. Use when planning the test approach for a feature or system, when test effort is scattered or reactive, or when coverage goals need to be backed by evidence, not vibes."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: tester
  sdlc-stage: testing
  version: 1.0.0
---

# Test Strategy

## Overview

A test strategy decides WHERE the test budget goes before the tests are written: which layers carry the risk, what coverage is actually worth, and what automation genuinely buys. It is the answer to "how will we know this is right?" — scoped by risk, staged by cost, and owned by the team rather than improvised per sprint.

## When to Use

- Planning the test approach for a feature, service, or release.
- Test effort feels scattered (everyone tests different layers) or reactive (tests after incidents).
- Coverage goals must be set and defended ("90% coverage" with no reasoning is not a goal).
- Choosing what to automate vs to keep manual.

**When NOT to use:**

- Writing the individual tests — that is `tst-unit-testing`/`tst-integration-testing`/`tst-e2e-testing` etc.
- The RED-GREEN-REFACTOR implementation loop — that is `be-tdd`.

## Process

### Step 1 — Put risk first

List the things that would hurt most if broken: money movement, authZ, data loss, core user journeys (and their NFRs, per `arch-nfrs`). The strategy concentrates the pyramid's layers where the risk lives — the pyramid is a shape, not a quota; a payment flow earns integration depth that a settings page does not.

### Step 2 — Shape the test pyramid honestly

- **Unit** (fast, many) for logic and rules at every edge.
- **Integration** (fewer, slower) at real seams: the DB-boundary queries, the messaging contracts, external-service adapters via real loopback/testcontainers — this is where the pyramid's missing-middle bugs actually live.
- **E2E** (few, precious) only for the critical user journeys that cross the whole stack.
- State the planned ratio as a starting point (80/15/5 per `be-tdd`) and then let RISK revise it — the artifact of the strategy is the final distribution and the reasoning.

### Step 3 — Set coverage goals with evidence, not vibes

- Coverage is a conversation about **what is worth protecting**, not a percentage trophy: measure line/branch coverage on the layers where bugs are expensive, and let it be lower where logic is thin glue.
- Coverage goals per tier: "core domain ≥ 90%, controllers 60%, glue tolerated low but reviewed".
- A coverage number that nobody acts on is a decoration; the goal comes with the question "what risk does this number protect?"

### Step 4 — Automate what repeats; keep manual what judges

- Automate: regression-prone checks, contract surfaces, anything CI can run faster than humans.
- Keep manual (deliberately, with owners): exploratory passes, visual/UX judgment, data-consistency spot checks that resist stable assertions.
- "We'll automate it later" is a strategy FAIL unless the manual step has an owner and a removal date — otherwise the manual smoke stays forever as an unowned ritual.

### Step 5 — Define the test levels & their exits

For each tier, name: the environment it runs in, the data it needs, how it's triggered (per-commit / nightly / pre-release), and what "green" means. The strategy becomes executable the moment a signal — CI status per tier, release gate — can be derived from it. Without exit definitions, the strategy is an essay.

### Step 6 — Review the strategy against the failure record

Test strategy is a living artifact: after each incident, ask "would the current strategy have caught this?" — if not, the strategy changes (a test, a tier, or an automation decision). The strategy is wrong when the answer stays "no" and nobody moves.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "90% coverage everywhere" | A percentage without a risk story protects the wrong things expensively. |
| "E2E tests cover everything" | E2E coverage is slow, flaky, and late — it finds what the lower tiers already priced. |
| "We'll automate the smoke test later" | Later is an unowned manual ritual; schedule the automation or drop the promise. |
| "Risk-based testing is just gut feeling" | Risk-based is evidence-weighted — the record of what broke before is the evidence. |
| "The pyramid is for other teams" | The pyramid is the budget guide; everyone with a test budget has one. |

## Red Flags

- Coverage numbers with no risk reasoning or per-tier goal
- E2E-heavy suites doing what integration should; zero integration at DB seams
- No test tiers defined (environments/data/triggers/exit)
- Manual smokes with no owner and no automation date
- Strategy never revised after incidents
- Test effort invisible to CI/release gates

## Verification

- [ ] Risks prioritized; pyramid shaped by risk with the final distribution reasoned
- [ ] Coverage goals per tier, tied to the risk they protect
- [ ] Automation decisions explicit; manual items owned with dates
- [ ] Test levels defined: environment, data, trigger, exit criterion
- [ ] Strategy revised after incidents (would-it-have-caught review)
- [ ] Strategy readable as executable signals (CI tiers, release gates)