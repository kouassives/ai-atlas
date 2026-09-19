---
name: tst-test-design-techniques
description: "Designs test cases systematically from requirements: equivalence partitioning splits inputs into ranges, boundary value analysis probes boundaries, decision tables cover condition combinations, and state transitions test flows. Use when designing a test case set, when coverage of a rule or boundary is accidental, or when a feature's input space needs structured sampling."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: tester
  sdlc-stage: testing
  version: 1.0.0
---

# Test Design Techniques

## Overview

The number of inputs a system accepts is infinite; the tests you can write are finite. Test design techniques turn the infinite input space into a small, high-yield sample: inputs that behave alike get grouped (partitioning), the dangerous edges get explicitly probed (boundaries), rule combinations get enumerated (decision tables), and stateful flows get walked as machines (state transition). These are the tools that make requirement-derived test design exact instead of accidental.

## When to Use

- Turning requirements/acceptance criteria into test cases (`arch-requirements-analysis` feeds this).
- A rule with ranges, limits, or combinations needs systematic coverage.
- Reviewing whether an existing suite actually covers the space or just the obvious middle.
- Stateful flows (wizards, orders, sessions) that change behavior based on history.

**When NOT to use:**

- Random exploratory testing (that has its own session discipline).
- Where the framework's property-based testing is the better tool (generative invariants) — still, the partitions often feed the generator.

## Process

### Step 1 — Equivalence partitioning

Group inputs into classes that the system treats identically (valid/invalid, per rule): for an order quantity with 1..99 valid: valid partition (1-99), invalid-low (≤0), invalid-high (≥100). **One representative per partition** is enough — testing three numbers inside 1-99 tests the same road three times.

### Step 2 — Boundary value analysis

Boundary bugs concentrate at the edges of partitions. For each boundary, test **on, just-below, just-above**: quantity 0, 1, 2 and 98, 99, 100. Include the validated parser edge (string lengths, format tolerances, off-by-one in pagination/loops). Rules: inclusive vs exclusive is a fact to be pinned, not assumed.

### Step 3 — Decision tables for rule combinations

When behavior depends on combinations of conditions (discount × membership × minimum order), build the table:

| Condition | R1 | R2 | R3 | R4 |
|---|---|---|---|---|
| is_member | Y | Y | N | N |
| order ≥ 50€ | Y | N | Y | N |
| **discount** | 10% | 0% | 5% | 0% |

- Every column is one **test case**; every applicable combination gets a column. Missed combinations are missed behaviors, and the table makes the miss visible during review.
- Collapse with "—" (don't care) only when the behavior genuinely does not depend on it — then keep one representative.

### Step 4 — State transition testing for flows

- Model the flow as states + events + transitions (+ guards): e.g. order states `new → paid → shipped → delivered`, with invalid transitions (`paid → delivered` must not exist).
- Test each **transition** at least once; test each state's **invalid/guarded events** (cancel after ship should be rejected); walk the full happy path and the failure-path recoveries (payment failed → retry → paid).
- This is where unexpected-event coverage (double-submit, late cancel, stale token) is born.

### Step 5 — Negative and robustness cases

Every technique produces the positive AND negative side: invalid partitions, boundary violations, forbidden transitions, malformed payloads, and the all-business-side failure shapes (`fnd-security-basics` steps: authz, injection, size caps). A test set with only happy paths is a demo, not a suite.

### Step 6 — Name cases, then trace them

Each derived case is traceable to a requirement line or edge-case catalog entry (checklist from `arch-requirements-analysis`): "QTY-B-01: boundary 100 above max". Untraceable cases are either speculative weight or lost requirements. The trace makes coverage reviewable in both directions.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Test a few random inputs, that's enough" | Random inputs cluster in the peaceful middle; the bugs live at boundaries and combinations. |
| "The table has too many columns" | The columns are the combinations the feature actually has — the table is exposing truth, not bloat. |
| "Boundaries are obvious, we cover them" | Off-by-one is the most frequently-missed defect class in review; obviousness is retrospective. |
| "State machines are overkill for this flow" | Any flow with history IS a state machine; the technique is how its illegal transitions get tested. |
| "We only test what the user can do" | Users do exactly what the tests ignore, in the order the tests never tried. |

## Red Flags

- Multiple redundant cases inside one partition; boundaries uncovered
- Decision combinations with no table (misses invisible during review)
- Flows tested happy-path only; illegal transitions never asserted
- No negative/robustness cases (authz, caps, malformed input)
- Test cases with no requirement traceability
- Only middle-of-range values everywhere (bell-curve coverage)

## Verification

- [ ] Partitions enumerated with one representative each (valid + invalid)
- [ ] Boundaries tested on/just-below/just-above, inclusive-vs-exclusive pinned
- [ ] Decision tables built for combinatorial rules; don't-care collapsed consciously
- [ ] State transitions: every transition + guarded/invalid events + recovery paths
- [ ] Negative/robustness cases present (authz, size caps, malformed inputs)
- [ ] Every case traceable to a requirement or edge-case catalog entry