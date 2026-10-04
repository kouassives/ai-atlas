---
name: tst-test-minimization
description: "Prunes a test suite to the smallest set that still fails when the code is broken: inventory every test, judge each by the oracle it actually asserts, and confirm with per-file mutation testing. Use when there are too many tests, when a suite is bloated or slow because of its size, when tests look redundant or one behavior is asserted in three places, when tests assert nothing, or when someone asks which tests can be deleted."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: tester
  sdlc-stage: testing
  version: 1.0.0
---

# Test Minimization

## Overview

Suite reduction is a maintenance activity governed by an evidence rule, not a taste judgement about the right number of tests. The load-bearing fact is that coverage is a poor proxy for fault-detection: covered suites miss real defects, uncovered suites are sometimes safe. So a suite is pruned against the **kill-a-mutant** criterion — a test is kept only if it kills a mutant no other test kills — and never against coverage numbers, which locate candidates but decide nothing.

## When to Use

- The suite is suspected oversized: "too many tests", "our test suite is bloated", the maintenance cost of tests is questioned.
- The same behavior is asserted at several tiers — one rule checked in the domain, again in the use case, again over the API.
- A generated or AI-written suite just landed and nobody vouched for a single row of it.
- The suite is slow because it is large (not because of one slow test).
- Someone asks which tests can be deleted, or asks to remove redundant tests.

**When NOT to use:**

- Writing NEW tests — that is `tst-unit-testing`, `tst-api-testing`, `tst-integration-testing`.
- Choosing which existing tests to RUN for a change — that is `tst-regression` (selection and prioritization, not reduction).
- Diagnosing one slow request or endpoint — that is performance work, not suite reduction.

## Process

### Step 1 — Inventory to a sheet

One row per test, no sampling. Columns:

- **test id** — file plus test name, so the row can be re-run by id.
- **layer** — domain / use-case / controller / repository-adapter / external-client / e2e.
- **behavior under test** — ONE sentence, in the domain's words, no method names.
- **the oracle** — what does it actually assert? Return value, raised error, persisted row, emitted call. If the honest answer is "nothing, it never fails on a wrong input", write that.
- **collaborators and how substituted** — real, stub, mock, or none.
- **kills mutants in file?** — per-file mutation result from Step 3; left empty until measured.
- **verdict** — KEEP / DELETE / QUARANTINE.
- **reason** — one clause, citing the Step 2 condition letter or the measured evidence.

The decisive rule: **if a row cannot produce a one-sentence behavior, that is the finding.** A test nobody can describe is a test nobody can justify, and its name was almost always copied from a method rather than a rule. Template and a worked example: `references/audit-sheet.md`.

### Step 2 — Judge the oracle, not the count

A test exists only if it can fail when the behavior breaks. DELETE when any one condition holds:

- **(a) Dead target** — the production symbol it tested no longer exists, or was renamed long ago and the test still passes because it no longer reaches real logic.
- **(b) No oracle, or a copied oracle** — it has no assertion, or its expected value was copied from the implementation's actual output. `expect(result.total).toBe(41)` where 41 came from running the code once is a tautology: it passes against every mutant by construction, which is negative value, not zero value.
- **(c) Duplicate behavior AND duplicate oracle** — the same one-sentence behavior with the same expected value, in two files. Keep the lowest tier that decides the rule and delete the higher-tier copies; one behavior has one owner.
- **(d) Query-call assertions** — it asserts the call sequence or call count of a *query* collaborator. Two reads in a row, and two orders of independent reads, are both correct; the assertion pins the code's shape, not its behavior.
- **(e) Private internals only** — its only oracle is a private field, a private helper, or a mock's internal state. Plumbing earns zero tests.

KEEP when either holds:

- It **kills a mutant no other test kills** (measured in Step 3, not assumed).
- It is the **sole owner of a unique oracle** — no other row writes down that expected value, exception type, or persisted state.

QUARANTINE is the honest default for everything in between: skip it, never delete it, record the reason in the sheet, and re-visit after the next real defect in that area. Skipping is reversible; deleting is not.

### Step 3 — Verify by breaking the code

Per-file mutation delta is the check. A global mutation score is not a decision input — it averages away exactly the per-test evidence you need.

Operational loop, one file at a time:

1. Run mutation scoped to the file under audit (operators on that file, every test that touches it). Never the whole repository.
2. Delta above measurement noise → **KEEP**. A unique kill of even one mutant counts — you are not hunting a quota.
3. Delta inside noise → re-run once to confirm. Confirmed zero AND no other test kills those mutants → **KEEP**. This is the case people skip: a test that never failed on its own may hold the suite's only oracle.
4. Otherwise → **QUARANTINE** (skip it, record the row, re-visit).

Two cautions:

- **Never-failing is LOW RISK, not worthless.** A test that survives every mutant may still be the only place a specific expected value is written down. Low risk → verify, then keep. Unexamined → delete by default, which is how nets acquire holes.
- **Some survivors are unkillable by construction.** An *equivalent mutant* changes the code without changing the behavior, so no correct test can kill it. Before quarantining a survivor, ask whether the mutation is actually equivalent; if it is, the test is fine and the mutant is noise.
- **Scope mutation to the file, never the whole suite.** A full run on a large suite is a multi-hour job that gets abandoned on Thursday. A per-file run is minutes and finishes. A pruning effort that never completes has deleted nothing.

### Step 4 — Prune in small batches

- **Skip before delete.** Mark every DELETE candidate with a reason referencing its sheet row (`skip: dup oracle, sheet row 12` — or `@Disabled` / `xit` / `.skip` in stacks that use them). A skip is reversible and reviewable; a deletion is neither.
- **Observe a quarantine window** — at least one release cycle or two weeks of CI — before a skip becomes a deletion. The window runs **once per batch**, not once per test.
- **Batch by duplication class, not by arbitrary size.** One commit per oracle-duplication class: every copy of one duplicated rule shares one sheet reason and one commit, because they are one finding. Unrelated deletions stay in separate commits, and anything touching shared fixtures or global setup gets its own. Rationale: a batch deletion of dozens of *unrelated* tests destroys attribution — when the suite goes red three commits later, nobody can tell which deletion did it, and the cheapest response is to restore all of them.
- Pruning a 300-test suite by two tests per commit does not converge. Grouping the duplicates is what makes the procedure finish.

### Step 5 — Exit criteria

Five checks. **No target count** — no source supports a number of tests a suite should have, so do not invent one and do not prune toward one.

1. A one-line production change touches few tests, usually one or two. Change one comparison operator and count the failures: that number is the real cost of the suite's coupling.
2. You are rarely hesitant to change code for fear of production bugs. This is the actual sufficiency test; every other check is a proxy for it.
3. No *unexplained* skipped tests remain — every surviving skip carries a sheet row, a reason, and a revisit trigger — and no failure was ever explained away ("probably flaky", "unrelated").
4. Breaking the code still fails something — verified by per-file mutation, not assumed from a green baseline.
5. Every remaining test can name why it exists in one sentence, and that sentence is a behavior, not a method name.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I deleted 60% and CI stayed green, so they were useless" | One green run is not evidence; only the kill-a-mutant criterion decides, and a run that stays green cannot tell you which mutation nobody was watching. |
| "Coverage stayed the same, so nothing was lost" | Coverage equality is exactly the trap: a redundant test deleted and a real test deleted produce an identical coverage report. |
| "The suite is our safety net" | A net with holes is not a net. The question is not how big the net is but which holes are load-bearing, and only mutation says which. |
| "We'll prune it next sprint" | Next sprint never comes, and every merge in the meantime adds tests — deferred pruning is the only kind that grows the suite. |
| "Never-failing test, but I'll keep it just in case" | "Just in case" without a mutant check is a test that outlives the behavior it claimed to protect, and keeps costing maintenance for years. |

## Red Flags

- Deleting on coverage equality, or on "CI stayed green after the change"
- Running whole-repo mutation instead of per-file scoped (multi-hour, abandoned, nothing pruned)
- Deleting auth tests for being repetitive across endpoints — the repetition is the pattern, so keep one representative per class, not zero
- Batch deletions of *unrelated* tests in one commit (attribution dies with the batch); one duplication class per commit is correct
- Quarantining a survivor without asking whether the mutant is equivalent
- Keeping never-failing tests without a mutant check, citing "just in case"
- Pruning while the suite is red — you lose the baseline and can no longer tell a deletion from a pre-existing failure

## Verification

- [ ] Every test inventoried with a one-sentence behavior
- [ ] Every DELETE candidate justified by one of the five oracle conditions
- [ ] Every KEEP justified by a unique killed mutant or a unique oracle
- [ ] Per-file mutation used as the arbiter; no global score as the decision
- [ ] Pruned one duplication class per commit with reasons; quarantine window observed per batch
- [ ] All five exit criteria checked; no invented target count

## References

- [Audit sheet template and worked example](references/audit-sheet.md) — the Step 1 table, and a reduced API suite with a verdict per row.
