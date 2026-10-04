---
name: tst-unit-testing
description: "Writes unit tests that stay fast and honest: isolation, naming, mocking discipline, one owner per behavior, and a kill-a-mutant oracle. Use when writing unit tests, when unit tests are slow or over-mocked, when suites assert implementation details, when coverage is gamed instead of meaningful, or when deciding whether a given class deserves a test at all."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: tester
  sdlc-stage: testing
  version: 1.1.0
---

# Unit Testing

## Overview

Unit tests are the pyramid's base: each one runs in milliseconds and isolates a single unit of logic. Their discipline is **isolation and honesty** — fast, deterministic, behavior-asserting, and immune to the two classic diseases: the over-mocked suite that proves a fiction, and the detail-coupled suite that breaks on every refactor. A third disease now does most of the damage: the suite that asserts one rule at three tiers, so a single behavior costs three tests.

## When to Use

- Writing or improving unit tests for logic (domain rules, calculators, validators, reducers).
- Deciding whether a unit deserves a test at all (a mapper, a constructor, a framework glue class).
- A rule already tested in the domain is being re-asserted in the use case or the controller.
- Unit tests are slow, order-dependent, or need 50 mocks per test.
- A suite that was "green" broke during a rename — detail-coupled tests.
- Coverage is high on paper but the tests assert nothing about behavior.

**When NOT to use:**

- The RED-GREEN-REFACTOR loop of writing them first — that is `be-tdd`.
- Testing the wiring of components together (real collaborators) — that is `tst-integration-testing`.
- Pure plumbing with no rule of its own: getters, setters, constructors, entity↔DTO mappers, framework glue, framework primitives. In a Clean Architecture or DDD codebase these classes dominate the file count, and they earn no test — they restate a field list that the round-trip or schema test already pins, so a test of them adds maintenance without adding a decision. **The exception that proves the rule:** a *computed* accessor (`getDiscountedTotal()`, `get isExpired()`) carries real logic, branches, and can fail when the logic breaks — test it in the domain test. `be-tdd` states the same rule at implementation time.

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

### Step 4 — One owner per behavior

Test a business rule at the **lowest tier that decides it**, and nowhere else. A discount rule with branches belongs to the domain: the domain test asserts the arithmetic; the use-case test asserts only its own orchestration — it calls the domain, maps domain errors to use-case outcomes, passes the ports through — and never re-asserts the arithmetic; a surface test asserts the HTTP projection and nothing about how the total was computed.

Re-asserting a rule one tier up adds **no detection power** (the mutation that breaks the domain already breaks that test) and multiplies the maintenance cost of every future change. Diagnostic: **if two tests fail for the same reason on one rule change, one of them is in the wrong tier** — move it down or delete it (`tst-test-minimization`).

### Step 5 — Coverage with a conscience: judge by the oracle

The only question that matters is whether the test can **fail**. Split the filter by when it is measurable:

- **Before writing** — check whether a lower tier or an existing test already owns this oracle. If one does, the new test is a duplicate and does not get written.
- **After writing** — confirm it kills a mutant no other test kills. Flip `>` to `>=` in the rule and the mutation should die. If it kills nothing that no other test also kills, quarantine it or delete it (`tst-test-minimization`).

Coverage numbers are a **poor proxy** for fault detection — covered suites miss real defects, uncovered suites are sometimes safe. Use the report as a **locating tool** for the branch nobody thought about, then decide deliberately.

- **Stop gaming coverage**: no coverage pragmas to silence a number, no test that calls a function just to color a line green. Coverage is the map, not the journey.
- An expected value copied from the implementation's actual output is a **tautology**, not an assertion: `expect(total).toBe(41)` where 41 came from running the code once passes against every mutant by construction. Derive the number from the rule first, then confirm the code produces it.
- A test with no assertion is negative value: it costs maintenance, detects nothing, and reads as safety.

### Step 6 — Keep the suite fast and parallel

- The suite runs in **seconds**. Volume is a *consequence* of the number of distinct behaviors, never a target: a behavior-rich domain earns many unit tests, a thin-glue layer earns almost none, and neither number is ever chosen.
- No network, no sleeps, no shared filesystem state; parallel-safe by construction (no shared mutable global).
- A unit test that sleeps on a timeout is a slow integration test wearing a unit costume — fix the seam, not the setTimeout.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Mock everything so tests are isolated" | Isolation is determinism at real seams, not a mock party; wealth of mocks = poverty of truth. |
| "We assert the internal call to be safe" | Detail-asserting tests break on every refactor and then get deleted — the net evaporates. |
| "Test the use case too — it's a layer, it deserves a test" | Layers are tested at different altitudes, not at the same altitude twice; the domain test already kills every mutant the use-case copy would catch. |
| "I ran the code, it returned 41, so expect 41" | Output copied from the implementation passes against every mutant by construction; write the expectation from the rule, then confirm. |
| "100% coverage is the goal" | 100% with no behavioral assertion is the most expensive lie a suite can tell. |
| "Sleeping 2s makes the test more realistic" | It makes it slow and flaky; realism belongs to the integration tier. |
| "One assert per test is dogmatic" | It is about one BEHAVIOR, and behavior families are fine — assert the outcome as a family, not the calls. |

## Red Flags

- Tests tied to method calls/internal implementation; break on rename
- Mocks for in-house code with real logic (`be-tdd` §6)
- Slow unit tests: sleeps, network, shared global state
- Coverage dressed up (pragmas, call-for-the-line tests)
- Assertions that never check the outcome family (no throws, no state)
- A test with no assertion at all — pure maintenance cost
- An expected value derived from the implementation's output instead of from the rule
- A test for a getter, setter, constructor, or entity↔DTO mapper
- The same rule asserted in both the domain and the use case
- Tests that only pass in a specific order

## Verification

- [ ] One behavior per test; asserts outcomes through the public surface
- [ ] Names read as specifications
- [ ] Mocks only at real seams; minimal real collaborators preferred
- [ ] No mocks of the unit itself/language/framework behavior
- [ ] Every test kills a mutant no other test kills, or owns a unique oracle
- [ ] No behavior asserted at more than one tier; each rule owned by the lowest tier that decides it
- [ ] No test for pure plumbing (getter, setter, constructor, mapper, framework glue)
- [ ] Coverage used to locate untested branches; not gamed, no silencing pragmas
- [ ] Suite fast (< seconds), deterministic, parallel-safe