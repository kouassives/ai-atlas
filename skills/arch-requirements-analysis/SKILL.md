---
name: arch-requirements-analysis
description: "Turns vague asks into requirements: user stories, acceptance criteria, edge cases, and explicit non-goals. Use when an ask is underspecified, when a feature request has no definition of done, when stakeholders disagree on scope, or before any design or implementation work begins."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: architect
  sdlc-stage: analysis
  version: 1.0.0
---

# Requirements Analysis

## Overview

Nearly every failed build traces to requirements that were assumed, not agreed. This skill converts an underspecified ask into a small, reviewable requirements artifact: user stories with acceptance criteria, named edge cases, and — critically — explicit non-goals. The output is the contract that Gate 1 of any engineering workflow checks before design and implementation begin.

## When to Use

- An ask is a sentence ("make login better") with no measurable outcome.
- A feature request has no definition of done or acceptance criteria.
- Stakeholders disagree on what "done" means, or scope keeps moving.
- Before system design and implementation — requirements first, always.
- When reverting to the user for clarification is needed but you want to bring questions, not a blank page.

**When NOT to use:**

- The requirement is already a crisp spec with acceptance criteria — go straight to `arch-system-design`.
- Gathering market/product strategy (that is upstream — see the `ui-`/product skills).

## Process

### Step 1 — Extract the ask into a WHERE/WANT/DONE shape

For the original ask, answer three lines:
- **WHO** needs it (role, not person) and **WHY** now (the driver).
- **WHAT** observable behavior must exist when it is done ("the user can X without Y").
- **What is explicitly OUT**: non-goals for this iteration.

If WHO/WHY cannot be answered, the ask is not ready — return questions, not guesses.

### Step 2 — Write user stories with story-level acceptance criteria

```text
As a <role>,
I want <capability>,
so that <outcome>.

Acceptance criteria:
- Given <context>, when <action>, then <observable result>
```

- Given/When/Then criteria are testable statements of behavior, not implementation.
- Each story gets **"and" removed**: one capability per story. A story with "and" is two stories.
- Keep stories small enough to be delivered and demoed in an iteration.

### Step 3 — Derive the edge case catalog

Walk each acceptance criterion against its negation and boundaries:

- **Empty / missing** inputs (no items, blank fields, first-run state)
- **Boundaries**: min/max/max+1/exactly-at-limit (see `tst-test-design-techniques` for the full toolset)
- **Duplicate & concurrent**: same request twice, two users same resource, retries
- **Permission variants**: no role, different role, resource the user does not own
- **Failure modes**: dependency down, timeout, partial success, then retry

Each surfaced edge case that is in-scope becomes its own acceptance criterion. Edge cases you decide are out-of-scope must be listed under non-goals with a reason.

### Step 4 — Write the non-goals explicitly

Non-goals are the antidote to scope creep: they name what this work will NOT do, in this iteration, and why. A requirements artifact without non-goals is a scope-open invitation. Examples: "no mobile support this iteration (web only)", "no real-time updates (polling acceptable)".

### Step 5 — Validate with the cheapest feedback

- Read each acceptance criterion aloud as a test: can a tester write a failing test from it today? If not, it is too vague.
- Confirm the story list against the WHO/WHY: does every story serve the driver?
- Get sign-off from the asker (or a named proxy) on stories + non-goals BEFORE design. "No sign-off" is a red flag, not a hurry signal.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We all know what this means, just build it" | "We all know" is how requirements drift silently until demo day. |
| "Acceptance criteria slow us down" | They are the only objective definition of done; without them "done" is whoever said it last. |
| "Non-goals are negative thinking" | They are the cheapest contract against the scope creep everyone argues about later. |
| "The edge cases are obvious" | The edge cases are where production incidents live; obviousness is retrospective. |

## Red Flags

- A story with no acceptance criteria
- An ask with a solution embedded ("add a button"), not a behavior
- Edge cases waved off as "we'll handle them during implementation"
- No non-goals section
- No named person who owns the requirement's accuracy
- Stories so large they cannot be demoed in an iteration

## Verification

- [ ] WHO/WHY/WANT stated; driver named
- [ ] User stories one-capability each, with Given/When/Then acceptance criteria
- [ ] Edge case catalog derived (empty, boundary, duplicate, permission, failure) and every in-scope case converted to a criterion
- [ ] Non-goals explicit, each with a reason
- [ ] Criteria are test-writable from a clean reading
- [ ] Sign-off obtained from the asker on scope + non-goals