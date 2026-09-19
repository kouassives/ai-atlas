---
name: arch-design-patterns
description: "Chooses and applies classic GoF and architectural patterns by intent: the pattern's purpose, when to apply it, and its trade-offs. Use when facing a known problem shape — factories, strategies, observers, adapters, repositories, decorators — and when a pattern needs to be selected against a concrete context rather than applied by fashion."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: architect
  sdlc-stage: design
  version: 1.0.0
---

# Design Patterns

## Overview

Patterns are named solutions to recurring problem shapes — a shared vocabulary that lets two engineers say "adapter" instead of re-explaining translation layers. The discipline is selection, not application: each pattern has an intent that must match the ACTUAL problem, and each carries a trade-off that must be affordable. A pattern applied because it is familiar, to a problem it does not fit, is worse than no pattern.

## When to Use

- A known recurring problem shape appears: object creation, behavior selection, interface mismatch, one-to-many notification, caching/wrapping.
- Choosing a pattern for a concrete context and needing the intent + trade-off review.
- Reviewing existing pattern choices for misapplication.

**When NOT to use:**

- The problem is a one-off with no recurrence — a direct solution beats the pattern (YAGNI).
- The language already provides the pattern cheaply (closures as strategy/observer, functional composition) — use the simpler form.
- Distributed/architectural patterns (saga, outbox, bulkhead) live in `be-microservices-patterns`; decomposition decisions in `arch-microservices-architecture`.

## Process

### Step 1 — Name the problem shape, not the pattern

State the actual problem: "we create families of related objects with a configurable variant per environment", "two interfaces don't match", "many objects must react to one object's changes". If you cannot name the problem shape, you cannot select a pattern. Patterns are answers; the question is the shape.

### Step 2 — Match intent from the catalogue

| Problem shape | Pattern intents to evaluate |
|---|---|
| Object creation with variants / families | **Factory Method, Abstract Factory, Builder** (variant config, complex construction) |
| Behavior varies per context | **Strategy** (capsuled algorithms), **State** (behavior varies with internal state) |
| Object/interface mismatch | **Adapter, Facade** (shape translation vs simplified surface) |
| One-to-many change notification | **Observer** (event subscription), **Publisher/Subscriber** (via `be-async-messaging` at scale) |
| Wrapping with added behavior | **Decorator** (responsibilities stacked without subclassing) |
| Object graph coherence | **Prototype** (cloning), **Flyweight** (shared state) |
| Data access abstraction | **Repository** (collection-like persistence port — pairs with `arch-clean-architecture`) |

### Step 3 — Test the fit with the intent checklist

For the leading candidate, verify:
1. **Intent matches**: the problem really is the pattern's problem (not a neighboring one).
2. **Language leverage**: can a simpler idiom (closures, generics, duck typing, stdlib) deliver the behavior with less machinery? If yes — take the simpler form and note it.
3. **Cost affordable**: the pattern adds indirection/coupling; the team must be able to traverse it. Complexity budget spent here is unavailable elsewhere.

### Step 4 — Retain the trade-off in the code/ADR

For each pattern applied to a real boundary, leave the WHAT and the WHY-WASN'T-IT-SIMPLER where a reader will find it:
```text
// Strategy selected over compose-with-dispatch:
// variant set is open-ended at runtime (plugins), whitelisted via registry.
```

For boundary-crossing pattern choices, write an ADR (`fnd-adr`) — the alternatives and accepted cost deserve the immutable record.

### Step 5 — Review for pattern rot

Patterns decay into unintentional **anti-patterns**:
- *God Object* (facade that grew), *Sequential Coupling* (methods must be called in a secret order), *Singleton abuse* (global mutable state — prefer dependency injection), *Spaghetti* (un-ownable flows).

When reviewing, ask what the code would look like WITHOUT the pattern — the answer should be "more tangled", not "the same".

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It's a classic GoF pattern, it must be right" | Classic fit ≠ problem fit; the intent check is the whole game. |
| "We need a factory because we'll have many variants" | "Will have" is speculative — YAGNI; wait for the second real variant. |
| "Singleton is fine, it's just the config" | Global mutable state is the most-adopted anti-pattern; inject instead. |
| "Observer vs pub/sub — same thing" | Same shape, different scale: in-process listeners vs distributed events have different failure modes. |
| "The pattern adds safety" | Patterns add structure; safety comes from tests and invariants, which the structure must support. |

## Red Flags

- A pattern whose naming is legible but whose intent does not match the problem
- Patterns layered to compensate for another pattern's weak fit
- A factory with one product, an observer with one subscriber, an adapter with one shape
- Singletons carrying mutable state
- No note/ADR recording why the pattern was chosen over the simpler alternative
- Anti-pattern shapes: god objects, sequential coupling, spaghetti flows

## Verification

- [ ] Problem shape named BEFORE any pattern naming
- [ ] Candidate intent matched against the catalogue; alternatives considered
- [ ] Simpler language idiom considered and either taken or explicitly rejected with reason
- [ ] Trade-off affordable and recorded (note or ADR for boundary choices)
- [ ] No pattern rot shapes present; review answers "more tangled without it"
- [ ] No speculative pattern for a variant that does not exist yet