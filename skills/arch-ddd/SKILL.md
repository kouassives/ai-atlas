---
name: arch-ddd
description: "Models business domains with Domain-Driven Design: ubiquitous language, bounded contexts, aggregates, domain events, and anti-corruption layers. Use when modeling business domains, when the codebase language doesn't match the business vocabulary, when the team cannot agree on what an entity is, or when integrating with legacy or external systems with different models."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: architect
  sdlc-stage: design
  version: 1.0.0
---

# Domain-Driven Design

## Overview

DDD aligns software structure with business structure: the code's vocabulary, boundaries, and rules mirror how the business actually thinks and operates. Its core value is not tactical patterns but **strategic** clarity — a shared language, honestly drawn boundaries between subdomains, and explicit rules about how contexts integrate. Without strategic DDD, the tactical patterns (aggregates, events) are decoration.

## When to Use

- The business domain is where the real complexity lives (rules, invariants, state machines — not just CRUD on tables).
- Engineers and business people use different words for the same thing, or the same word for different things.
- Multiple teams/models touch the same concepts and keep overwriting each other's meaning.
- Integrating with external or legacy systems whose model does not fit yours.

**When NOT to use:**

- CRUD-simple domains with no business rules: DDD ceremony adds cost with no payoff — a straightforward service layer suffices (YAGNI).
- Greenfield "we'll do DDD because it's modern" without a named domain complexity problem.
- Denormalized read-model systems built purely for reporting (those follow `be-database-design`/CQRS rules).

## Process

### Step 1 — Build the ubiquitous language

Collect the business vocabulary from domain experts — the actual words they use (not the DB column names). Each term gets ONE definition, written down, used everywhere: in conversations, code identifiers, tests, and docs. The glossary page is the contract; a term with two meanings is a model bug, not a dialect.

### Step 2 — Carve bounded contexts

- Group the ubiquitous language into **bounded contexts**: subdomains where a model applies consistently and unambiguously (e.g. *Billing*, *Fulfillment*, *Risk*).
- Each context owns its model; the same word may legitimately differ BETWEEN contexts (`Customer` in Billing ≠ `Customer` in Fulfillment) — that is the point of the boundary.
- **Never** share a model class/table across contexts to "reuse" — shared models are how contexts bleed into a big ball of mud.

### Step 3 — Design aggregates: consistency boundaries

- Within a context, group entities into **aggregates** — a cluster with one **aggregate root** enforcing the cluster's invariants.
- Rule of thumb: keep aggregates small; a transaction spans exactly ONE aggregate. If a business rule needs two aggregates in one transaction, the aggregate boundary is wrong.
- Aggregate references go by **ID, not object reference** — that keeps boundaries real and plays well with `be-async-messaging`.

### Step 4 — Publish domain events for cross-aggregate and cross-context effects

When something significant happens (order placed, payment captured), the owning aggregate publishes a **domain event** to the surrounding integration layer. Other aggregates/contexts react via `be-async-messaging` — not by sharing state. Event names come from the ubiquitous language ("OrderPlaced", not "OrderWasChangedInDB").

### Step 5 — Defend the core with an anti-corruption layer (ACL)

When integrating with a legacy system, external vendor, or another context whose model conflicts with yours: build an **anti-corruption layer** that translates between models at the boundary. Your core never learns their vocabulary; the ACL owns the translation, the mapping tests, and the drift detection. Without an ACL, their schema decisions become your domain model decisions.

### Step 6 — Validate the model with a domain expert story

Walk the design back to a domain expert as a story: "when X happens, the system does Y, then Z". If the expert winces at a word, a boundary, or a rule, the model is wrong — fix the model, not the expert.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We have one Customer table, one model, that's simpler" | One shared model across contexts is how every team's meaning elbows everyone else's. |
| "Aggregates are too hard, we'll use services" | Services without aggregates leak invariants into orchestration soup — the hard part does not disappear. |
| "The legacy system's fields are our fields" | Adopting their schema is surrendering your model; the ACL is the price of integration. |
| "DDD means repositories and entities" | The tactical shapes without the strategic contexts are paperwork, not DDD. |
| "We can't change the words now" | You can always change the code identifiers; the glossary is yours to maintain. |

## Red Flags

- No ubiquitous language glossary, or terms used with two meanings in code/tests
- Contexts that share models/tables "for convenience"
- Aggregates with hidden invariants enforced by external services
- Transactions spanning multiple aggregates
- Domain events named after implementation ("RowUpdated") instead of the language
- Legacy integration with no ACL — foreign model drifting into the core

## Verification

- [ ] Ubiquitous language glossary exists and code/tests use its terms
- [ ] Bounded contexts drawn with explicit ownership; no model shared across them
- [ ] Aggregates defined with roots, small boundaries, ID references; invariants enforced within one aggregate
- [ ] Domain events named in the language and published via the integration layer
- [ ] Anti-corruption layer present (with mapping tests) wherever a foreign model enters
- [ ] Model validated with a domain expert story; winces result in model fixes