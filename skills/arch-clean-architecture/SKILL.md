---
name: arch-clean-architecture
description: "Structures an application backbone with Clean Architecture and hexagonal (ports & adapters) style: layers, the dependency rule, use cases, and entities. Use when structuring an application from scratch, when core business logic is tangled with frameworks and databases, or when the architecture needs to stay testable and replaceable at its edges."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: architect
  sdlc-stage: design
  version: 1.0.0
---

# Clean Architecture

## Overview

Clean Architecture (and its hexagonal/ports-and-adapters sibling) organizes code so the **business core has no dependencies**, and everything that matters to the outside — frameworks, databases, HTTP, UIs — plugs in at the edges through defined interfaces. The dependency rule is the entire discipline: source-code dependencies point INWARD, toward the core; the core depends on nothing.

## When to Use

- Structuring a new application's backbone where business rules are the real asset.
- Extricating tangled core logic from framework/database coupling.
- When testability without infra is a goal (core tested without DB/HTTP).
- When the team needs frameworks or databases to remain swappable at the seams.

**When NOT to use:**

- Prototypes, spikes, and short-lived tools: the layering cost buys replaceability you will never spend.
- Simple CRUD wrappers with no domain logic — Rails/Django-style slices are honest there (KISS, YAGNI).
- Event-sourced or CQRS-heavy systems where projections dominate — those follow their own shape (`be-microservices-patterns`, `arch-ddd`).

## Process

### Step 1 — Draw the four rings (conceptually)

```text
[ Enterprise/Infra: DB, HTTP, queues, framework adapters ]
[ Interface adapters: controllers, presenters, gateways     ]
[ Use cases: application business rules, orchestration        ]
[ Entities: core business rules, purest layer                 ]
```

Only the outer layers depend on frameworks. Arrows point inward; nothing in an inner ring imports an outer ring.

### Step 2 — Define the entities and use cases first

- **Entities**: the business objects with their own rules and invariants — no I/O, no framework types (no HTTP request, no SQL model), pure logic.
- **Use cases**: the application business rules — one use case per user-intent ("PlaceOrder", "CancelOrder"), each orchestrating entities and the **ports** it needs.

The use case never knows where data comes from or goes — it only knows the port interfaces.

### Step 3 — Ports & adapters: the exchange points

- A **port** is an interface the core defines that the outside world must satisfy: `OrderRepository`, `PaymentGateway`, `Clock`.
- An **adapter** is the concrete implementation of a port: `SqlOrderRepository`, `StripePaymentGateway`, `SystemClock`.
- Adapters live OUTSIDE the core. Swapping `SqlOrderRepository` for an in-memory or a different DB is a change of adapter, not of core.
- Rule: the core owns the interfaces that point into it (driven ports) AND the interfaces it calls (driving ports). The direction of the dependency is always the core's decision.

### Step 4 — Put dependencies at the edge: composition root

All wiring happens in the **composition root** (main, DI container setup, bootstrap): here adapters are constructed and handed to the core through ports. Nowhere else may concrete infra types be constructed. This is the single place where the shape is assembled — and the place tests also assemble from.

### Step 5 — Keep the layers honest under pressure

- **Entities** must never know about HTTP, SQL, JSON, or ORM.
- **Use cases** may raise domain errors; they may not return transport concerns (status codes belong to adapters).
- If a change to the DB causes edits inside the core, the dependency rule is violated — refactor the port boundary, not the core.
- Do not confuse "clean" with "many layers": one use case + one port per boundary is normal; a layer with no delivery is not architecture, it is ceremony.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The framework IS the architecture" | Frameworks are outer rings with opinions; the dependency rule keeps their opinions out of your core. |
| "We'll do it properly later" | Later means after the core grew framework tentacles; untangling is the expensive part. |
| "Ports for everything = indirection overload" | A port exists per replaceable/teatable boundary, not per class; unneeded ports ARE overload. |
| "Entities with no framework types is impractical" | That is precisely what makes them testable in milliseconds, forever. |
| "We can't change the architecture now" | You can always stop leaking outward; the rule is about the next line of code too. |

## Red Flags

- Core imports framework/database types (HTTP request objects, ORM entities)
- Use cases constructing concrete repositories/adapters inline
- Multiple composition points spread across the codebase
- Entities that serialize themselves or know their storage
- Dependency arrows pointing outward (core → infra)
- Layers that exist but deliver no behavior (empty ceremony)

## Verification

- [ ] Four rings drawn; dependency rule stated and followed (arrows inward)
- [ ] Entities pure business logic; no I/O, no framework types
- [ ] Use cases one-per-intent, orchestrate via ports only
- [ ] Ports owned by the core; adapters outside; composition root is the single assembly point
- [ ] Testability demonstrated: core testable without DB/HTTP
- [ ] No ceremony layers — every layer delivers behavior
- [ ] Framework/database swap is an adapter change, provable by inspection