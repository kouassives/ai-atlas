---
name: tst-test-strategy
description: "Plans a testing approach: test pyramid and quadrants, risk-based scoping, a test budget sized by blast radius, and what to automate versus not. Use when planning the test approach for a feature or system, when test effort is scattered or reactive, or when someone asks how many tests a feature needs."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: tester
  sdlc-stage: testing
  version: 1.1.0
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
- Pruning an existing suite that is already too large — that is `tst-test-minimization`.

## Process

### Step 1 — Put risk first

List the things that would hurt most if broken: money movement, authZ, data loss, core user journeys (and their NFRs, per `arch-nfrs`). The strategy concentrates the pyramid's layers where the risk lives — the pyramid is a shape, not a quota; a payment flow earns integration depth that a settings page does not.

### Step 2 — Shape the test pyramid honestly

- **Unit** (fast, many) for logic and rules at every edge.
- **Integration** (fewer, slower) at real seams: the DB-boundary queries, the messaging contracts, external-service adapters via real loopback/testcontainers — this is where the pyramid's missing-middle bugs actually live.
- **E2E** (few, precious) only for the critical user journeys that cross the whole stack.
- State the planned ratio as a starting point (80/15/5 per `be-tdd`) and then let RISK revise it — the artifact of the strategy is the final distribution and the reasoning.

### Step 3 — Size the test budget by risk and sufficiency

- The pyramid is a shape, not a quota — and a behavior is tested at the **lowest tier that decides it**, so cross-tier duplication of the same rule is a pyramid violation, not diligence. One rule asserted in the domain, the use case and the controller is three tests and one behavior.
- Size the budget by blast radius: money movement, authZ, data loss and core journeys earn depth; a settings page and a thin CRUD endpoint do not. State the expected outcome as a *shape plus a rationale*, never a ratio alone.
- **The suite is finished when every behavior has exactly one owner and no test can be removed without losing a killed defect.** That is the exit condition — there is no target count, and inventing one is a failure.

### Step 4 — Set coverage goals with evidence, not vibes

- Coverage is a conversation about **what is worth protecting**, not a percentage trophy: measure line/branch coverage on the layers where bugs are expensive, and let it be lower where logic is thin glue.
- Set a per-layer goal **only** where a bug in that layer is expensive, and attach to every number the answer to "what risk does this number protect?". **No default percentages** — a number inherited from convention rather than from the risk map is decoration wearing a target's clothes.
- Where the logic is thin glue, a low or absent goal is the correct answer, and "reviewed" is not a coverage policy.
- Coverage is a poor proxy for fault-detection, so a coverage-derived target optimizes the wrong thing. The stronger signal for the layers that matter is whether the suite kills deliberate defects there (mutation testing, scoped to the core domain — see `tst-test-minimization`).
- A coverage number that nobody acts on is a decoration; the goal comes with the question "what risk does this number protect?"

### Step 5 — Automate what repeats; keep manual what judges

- Automate: regression-prone checks, contract surfaces, anything CI can run faster than humans.
- Keep manual (deliberately, with owners): exploratory passes, visual/UX judgment, data-consistency spot checks that resist stable assertions.
- "We'll automate it later" is a strategy FAIL unless the manual step has an owner and a removal date — otherwise the manual smoke stays forever as an unowned ritual.

### Step 6 — Define the test levels & their exits

For each tier, name: the environment it runs in, the data it needs, how it's triggered (per-commit / nightly / pre-release), and what "green" means. The strategy becomes executable the moment a signal — CI status per tier, release gate — can be derived from it. Without exit definitions, the strategy is an essay.

### Step 7 — Review the strategy against the failure record

Test strategy is a living artifact: after each incident, ask "would the current strategy have caught this?" — if not, the strategy changes (a test, a tier, or an automation decision). The strategy is wrong when the answer stays "no" and nobody moves.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "90% coverage everywhere" | A percentage without a risk story protects the wrong things expensively. |
| "This per-layer number is just standard" | A number borrowed from convention instead of from the risk map is decoration, not a goal. |
| "E2E tests cover everything" | E2E coverage is slow, flaky, and late — it finds what the lower tiers already priced. |
| "We'll automate the smoke test later" | Later is an unowned manual ritual; schedule the automation or drop the promise. |
| "Risk-based testing is just gut feeling" | Risk-based is evidence-weighted — the record of what broke before is the evidence. |
| "The pyramid is for other teams" | The pyramid is the budget guide; everyone with a test budget has one. |

## Red Flags

- Coverage quotas with no risk story; per-layer percentage targets inherited from convention
- A strategy that never states which surfaces it deliberately leaves thin
- Coverage numbers with no risk reasoning or per-tier goal
- E2E-heavy suites doing what integration should; zero integration at DB seams
- No test tiers defined (environments/data/triggers/exit)
- Manual smokes with no owner and no automation date
- Strategy never revised after incidents
- Test effort invisible to CI/release gates

## Verification

- [ ] Risks prioritized; pyramid shaped by risk with the final distribution reasoned
- [ ] Test budget sized by blast radius, with the shape and the rationale stated; the exit condition (one owner per behavior, nothing removable without losing a killed defect) written down
- [ ] Coverage goals, where set, are attached to a named risk and there are no default percentages; the strategy names what it deliberately leaves thin
- [ ] Automation decisions explicit; manual items owned with dates
- [ ] Test levels defined: environment, data, trigger, exit criterion
- [ ] Strategy revised after incidents (would-it-have-caught review)
- [ ] Strategy readable as executable signals (CI tiers, release gates)