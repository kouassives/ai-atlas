---
name: fnd-engineering-principles
description: "Applies the core engineering principles — SOLID, KISS, YAGNI, DRY, and composition over inheritance — to concrete design decisions. Use when designing a module or class, when code feels over-engineered or 'clever', when choosing between abstractions, when reviewing someone else's design, or when the team debates how much structure a solution needs."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: foundation
  sdlc-stage: implementation
  version: 1.0.0
---

# Engineering Principles

## Overview

Principles are decision rules, not laws. This skill maps each principle to the decision shapes it governs and to the smells that signal a violation, so you can apply them without ceremony. The goal is code that is **simple enough to be obvious** — not code that maximizes principle compliance.

## When to Use

- Designing a new module, class, or abstraction and unsure how much structure it needs.
- Code is flagged as "over-engineered", "clever", or "too abstract".
- Choosing between two designs (wrapper, inheritance, interface, helper…).
- Reviewing a change where the design is the question.
- A team debate about how to structure a solution.

**When NOT to use:**

- Concrete bug fixes or mechanics — this is not a style guide.
- Building a new component where an established codebase pattern already exists — follow the pattern first, principles second.

## Process

### Step 1 — Find the decision shape

Ask: *what is the cheapest structure that satisfies the current requirement?* Write it down. This answer is the KISS baseline.

### Step 2 — Apply YAGNI before designing anything

Build for the requirement you have, not the one you predict. A speculative abstraction is untestable code you maintain for free. If the predicted need shows up a **third** time, generalize then (see Step 4).

### Step 3 — Check DRY with the three-strike rule

Duplicate once: acceptable — keep the two copies, learn the difference. Duplicate twice (three occurrences): extract. Before extracting, verify the copies are actually the same concept; accidental similarity (same shape, different meaning) must NOT be unified.

### Step 4 — Apply SOLID by smell, not by checklist

| Principle | Smell that triggers it | Action |
|---|---|---|
| **S**ingle Responsibility | "A class with one more reason to change": the 'and' in its description ("parses AND saves") | Split by axis of change |
| **O**pen/Closed | You are editing a class to add behavior instead of adding it | Extend by composition or interface, not by opening the body |
| **L**iskov | A subclass breaks its parent's contract (throws where parent works, weakens postconditions) | Refactor to composition or a shared interface |
| **I**nterface Segregation | A client depends on methods it never calls | Split the interface; pass narrow slices |
| **D**ependency Inversion | High-level code imports a concrete low-level detail directly | Depend on an abstraction owned by the high-level policy |

The checklist alone passes broken code; the smell is what earns the fix.

### Step 5 — Prefer composition over inheritance

Inheritance is the tightest coupling in the language — a change to the parent ripples everywhere. Use it only for true "is-a" identity. For sharing behavior, use composition, delegation, or interfaces. If a hierarchy is more than two levels deep, treat it as a design smell.

### Step 6 — Before leaving a change, delete

Delete the abstraction, wrapper, or branch you no longer need; dead structure is the most common form of over-engineering. Ask: *does this still earn its complexity for a reader?*

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We'll need this later" | YAGNI: the later need is cheaper to build with the information you'll have then. |
| "It's just a small wrapper for now" | Wrappers dodge the existence of the concept they hide. |
| "The pattern requires an interface here" | Patterns name solutions, not obligations. Absent a second implementation, the interface is speculation. |
| "These two functions look the same" | Shape-similarity is not concept-similarity. DRY unifies meaning, not appearance. |
| "Layers will make this scale" | Every layer a reader must hold is a cost. Count concepts to test a design, not lines. |

## Red Flags

- An abstraction with exactly one implementation.
- A class/method whose description contains "and".
- Deep inheritance hierarchies (≥ 3 levels) built for reuse.
- "Helper", "Util", "Manager" classes accumulating unrelated logic (SRP violations).
- Tests that need heavy mocking to construct a simple object (over-abstraction).
- A refactor that relocates complexity without reducing the number of concepts a reader must hold.

## Verification

- [ ] The KISS baseline was written before any abstraction was considered
- [ ] Predicted-future needs were rejected or explicitly deferred
- [ ] DRY extraction has ≥ 3 occurrences and confirmed same-concept
- [ ] Every SOLID fix is justified by a named smell, not by checklist
- [ ] No inheritance hierarchy deeper than 2 levels remains in the change
- [ ] Dead or speculative abstractions were deleted, not preserved