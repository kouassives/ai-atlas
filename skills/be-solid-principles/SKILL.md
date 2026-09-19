---
name: be-solid-principles
description: "Applies the five SOLID principles to class and module design with before/after examples and the smells that signal each violation. Use when designing, extending, or reviewing classes and modules, when a class does too much, when abstractions feel wrong or leaky, or when dependency direction needs to be fixed."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: backend
  sdlc-stage: implementation
  version: 1.0.0
---

# SOLID Principles

## Overview

SOLID is the vocabulary for the most common design defects in object-oriented code: god classes, broken abstractions, and dependency tangles. The five principles are not decoration — each one names a concrete smell and prescribes the shape of the fix. This skill covers all five with before/after examples and the smell that triggers each check.

## When to Use

- Designing a new class, module, or service boundary.
- A class or module "does too much" or keeps growing.
- An abstraction (interface, base class, factory) feels wrong, leaky, or is fought by every new use case.
- Dependency direction is tangled, circular, or causes nightly fear of touching a base class.
- Reviewing another change against OO design quality.

**When NOT to use:**

- This is not a substitute for foundation design judgment — apply it alongside `fnd-engineering-principles` (KISS, YAGNI).
- Functional/procedural codebases with no shared mutable state and no inheritance: SOLID applies lightly there; do not force class hierarchies.
- Premature abstraction: never introduce an interface for a single concrete use (YAGNI beats SOLID decoration).

## Process

### Step 1 — Walk the five checks in order

1. **S — Single Responsibility.** Does this element have more than one reason to change? A class that "parses AND validates AND persists AND emails" has four. Fix: extract each axis of change into its own unit; the orchestration stays thin.
2. **O — Open/Closed.** Can behavior be extended without modifying this unit? Flag every `if (type == "x")` chain over a known type family. Fix: polymorphic dispatch, strategy function/interface, or a registry — not more branches.
3. **L — Liskov Substitution.** Can every subclass be swapped for its supertype without breaking callers? Smells: overriding methods that throw `NotSupported`, weaken preconditions, strengthen postconditions, or return stricter types than needed. Fix: the hierarchy is wrong — prefer composition (see Step 4) over patching.
4. **I — Interface Segregation.** Are clients forced to depend on methods they never call? Smells: fat interfaces, `UnusedMethod` stubs, `NotImplementedException`. Fix: split interfaces by client role; small interfaces with one job beat one big one.
5. **D — Dependency Inversion.** Do high-level policy modules depend on low-level details instead of abstractions? Smells: a business layer importing SDKs, frameworks, or infrastructure (DB, HTTP, file I/O) directly. Fix: invert — the high-level module owns the port (interface); the low-level adapter implements it. Dependency arrow points INWARD.

### Step 2 — Apply the principles to the concrete shape, not the label

For each violation found, produce the before/after shape:

```text
BEFORE  OrderService  →  parses CSV, validates, saves (SQL), emails, logs
AFTER   OrderImportService  (orchestrates; depends on ports)
        CsvOrderParser       (parses → domain DTOs)
        OrderValidator       (validates domain DTOs)
        OrderRepository      (port) ← SqlOrderRepository (adapter)
        EmailNotifier        (port) ← SmtpNotifier (adapter)
```

The after-shape needs no diagram to explain: each unit has one job, all arrows point inward, and any of them can be swapped or tested alone.

### Step 3 — Use composition over inheritance to resolve LSP failures

When three checks (L, and often O) fail on a hierarchy, the answer is almost always composition: move the varying behavior behind a strategy/port, keep one stable object that delegates. `extends` is the strongest coupling available — reach for it last.

### Step 4 — Verify dependency direction

Draw the dependency graph of the module (imports/inheritance/instantiations). The "core" must depend on nothing but language primitives and other core pieces. Every arrow pointing outward (core → infrastructure) is a D violation; invert it.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It's just one big function, SOLID doesn't apply" | Extract the axes of change — a module with one job is still S, O, D. |
| "The interface has a few extras, no one implements them" | Fat interfaces rot in place; every new client pays their cost. |
| "We can't change the base class, everyone uses it" | That is the smell: a base class too many things depend on. Extract, don't edit. |
| "A base class makes this DRY" | DRY across forced inheritance is worse than mild duplication with clear ownership. |
| "We'll refactor to SOLID later" | Later is now — every new feature buoys the same god class. |

## Red Flags

- Any class with three or more nouns in its name or three+ verbs in its public API
- `is-a` relations that fail the swapped-without-errors test
- Core modules importing framework/SDK types
- A base class no subclass overrides as designed (it's dead weight or a retrofit)
- `instanceof`/type-switch dispatch where polymorphism should carry it

## Verification

- [ ] Each of the five principles checked and named, with the smells found
- [ ] Every element has ONE reason to change
- [ ] Extension points are polymorphic/registry-based, not branch-based
- [ ] No `NotImplemented`/unsupported-override hierarchy stubs
- [ ] No client depends on methods it does not use
- [ ] Dependency arrows point inward; core imports no infrastructure
- [ ] No forced abstraction that a single-use case would not justify (YAGNI gate)