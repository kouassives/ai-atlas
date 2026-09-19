---
name: be-refactoring
description: "Performs safe refactoring: finding seams, preserving behavior, moving in small verified increments, and recognizing code smells from a catalogue. Use when improving existing code without changing behavior, when a codebase is hard to change and needs structural cleanup, when preparing a system for a feature it cannot currently hold, or when reviewing code that 'works but hurts'."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: backend
  sdlc-stage: operations-maintenance
  version: 1.0.0
---

# Refactoring

## Overview

Refactoring is behavior-preserving restructuring: the program's observable behavior does not change, while its structure improves so the next change is cheaper. The discipline is what separates refactoring from "rewriting it the way I like." This skill covers the safety machinery (seams, verification, small steps) and the smell catalogue that tells you WHAT to restructure.

## When to Use

- Improving code that works but is hard to change, test, or extend.
- Preparing a system for a feature: the shape resists the change, so restructure first.
- Extracting logic from a god function/class into testable units.
- Renaming, re-moduling, or de-duplicating across the codebase.

**When NOT to use:**

- When behavior MUST change — that is a feature change (`be-tdd` applies, refactor separately with different commits).
- When the code should be thrown away rather than restructured (tiny, dead, or unreadable-with-no-tests codebases may cost less to rewrite — say it explicitly).
- Cosmetic churn with no structural gain ("refactoring" as a rename party): every step must be justified by a smell.

## Process

### Step 1 — Find the seams

A seam is a place where you can alter behavior without editing the code's dependencies: an interface, a function boundary, a module edge, an indirection point. If there is no seam, create one **without changing behavior** first (extract function with identical logic), then proceed. Seams-first is the difference between safe moves and a big-bang edit.

### Step 2 — Lock behavior with a characterization net

Before the first structural move: if tests exist, run them green. If not, write **characterization tests** — tests that pin current behavior (including its oddities) without judging it. The net is the refactor's permission slip; without it, every move is archaeology with a lighter.

### Step 3 — Refactor in small verified increments

- One smell, one step: extract → run net → commit → next.
- **Never mix refactoring and feature work in one commit.** A commit that both moves code and adds behavior is unsafe to review and unsafely revertable.
- Each increment leaves the suite green; if a step breaks the net, the step was too big — bisect it, don't push through.
- Use the language's tooling (linters, type checker, compiler) as an additional net: types make renames and moves provable.

### Step 4 — Consult the smell catalogue

| Smell | Fix shape |
|---|---|
| Duplicated code | Extract; if three copies, the abstraction earns itself |
| Long method / god class | Extract until each element has one reason to change (`be-solid-principles`) |
| Feature envy | Move the method to the data it envies |
| Shotgun surgery | One change touches many units → consolidate ownership |
| Primitive obsession | Introduce a small type/value object (money, dates, ids) |
| Switch statements over types | Polymorphism/registry (`be-solid-principles`) |
| Data clumps | Extract the clump into a value object |
| Divergent change | Separate the axes of change into their own units |
| Message chains / middle man | Collapse the chain or inline the middleman |
| Dead code | Delete it — reverting is what git is for |

Every extraction must **reduce total reasoning load**, not relabel it: a new abstraction with a worse name than the code it hides is a net loss.

### Step 5 — Verify behavior preservation honestly

- The net (characterization + existing suite) green after every increment.
- For subtle behavior (ordering, null handling, error paths): characterization tests should specifically pin those — refactors love to break the boundary cases first.
- After the full refactor: suite green, diff reviewable as "moves only," and a quick smoke run of the real system. No new bugs introduced and no behavior "improved silently" — silent behavior changes during a refactor are bugs in progress.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It works, don't touch it" | That is precisely the moment before it stops working when you NEED to change it — refactor when the shape hurts to change. |
| "I'll refactor while I add the feature" | Mixed commits are review-proof and bug-rich; separate the concerns. |
| "The tests don't exist, but I'm just moving code" | Moving behavior without a net is a roulette wheel; characterization tests cost an hour and buy every later step. |
| "Big-bang is faster than many small steps" | Big-bang is the failure mode with the longest rollback story. |
| "It's cleaner now, I'll trust it" | Clean is only worth something if the net proves behavior survived. |

## Red Flags

- Refactoring commits that also change behavior (or tests asserting new behavior)
- Steps too large to bisect; suites red between increments
- No test/type net at the start of the refactor
- Extractions that rename without simplifying, or abstractions hiding worse names
- Structural churn touching code unrelated to the target smell
- "It should behave the same" as the only verification story

## Verification

- [ ] Seams identified or created with zero behavior change
- [ ] Characterization net in place (or existing suite green) before structural moves
- [ ] One smell per increment; suite green after each; commits refactor-only
- [ ] No feature work mixed into refactoring commits
- [ ] Boundary behaviors (ordering, nulls, errors) pinned by tests
- [ ] Refactor verified: suite green, diff is moves-only, real-system smoke ok
- [ ] Every change justified by a named smell — no churn