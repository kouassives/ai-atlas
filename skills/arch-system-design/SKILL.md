---
name: arch-system-design
description: "Produces high-level system design before implementation: components, boundaries, data flow, non-functional requirements, and explicit trade-off analysis. Use when designing a system or feature, when choosing between architectures or integrations, or when a design needs to be reviewed before code is written."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: architect
  sdlc-stage: design
  version: 1.0.0
---

# System Design

## Overview

System design turns agreed requirements (`arch-requirements-analysis`) into a shape the team can implement and argue about cheaply: components with responsibilities, boundaries between them, the data and control flow, NFRs that constrain the choices, and a **trade-off analysis** that records what was chosen, what was rejected, and why. The deliverable fits on a few pages — design that cannot be reviewed fits no one.

## When to Use

- Designing a new system or feature before code is written.
- Choosing between integration options, data stores, or architectures.
- A design review is requested and a written artifact is needed to review against.
- Altering an existing system's shape (new boundary, new component, new flow).

**When NOT to use:**

- Requirements are still fuzzy — that is `arch-requirements-analysis`, not design.
- The change is a local implementation detail with no boundary or flow impact — implement it (`be-*`).
- Picking a specific pattern for one problem shape — that is `arch-design-patterns`.

## Process

### Step 1 — State the constraints, then the design

Open with the non-functional constraints that actually bind this system: scale target, latency budget, availability, security/compliance data classes, cost ceiling (quantify from `arch-nfrs`). A design that ignores its NFRs is a fantasy; naming them up front makes every later decision checkable.

### Step 2 — Identify the components and their responsibilities

- List the components the system needs to do the required behavior — each with ONE responsibility (the SRP check from `be-solid-principles` applies at component scale too).
- Name the **ownership boundary** of each component: what data, what behaviors, what decisions are exclusively its own.
- No component may depend, at design time, on another's internals — dependencies are only through defined interfaces.

### Step 3 — Draw the data flow and the control flow

- **Data flow**: for each user-triggered path, where does data originate, where is it stored, who transforms it, who reads it. Include failure paths: retry, partial failure, timeout.
- **Control flow**: synchronous calls vs async messaging and where each belongs (`be-async-messaging` when in doubt).
- The diagram is the design's spine — if you cannot draw the flow, you do not have a design, you have a wish.

### Step 4 — Analyze trade-offs explicitly, per material decision

For every decision with a real alternative (storage engine, sync vs async, cache layer, service split), record:

```text
Decision: <choice>
Alternatives considered: <A>, <B>
Deciding forces: <the NFR or constraint that tipped it>
Accepted cost: <what this choice makes harder, and when to revisit>
```

The "accepted cost" line is the honest part — every design buys something and pays something. Only reconsider when the cost materializes, not when someone re-asks the question.

### Step 5 — Design the failure behavior, not just the happy path

For each dependency and each boundary: what happens when it fails slowly, fails fast, or returns garbage? Add timeout, retry-with-backoff, circuit breaker (`be-microservices-patterns`), dead-letter handling (`be-async-messaging`), and degrade-path statements where relevant. A design with only a happy path is a one-way ticket to incident mode.

### Step 6 — Fit the design into the architecture style

If the system has an established backbone (clean architecture, DDD contexts, hexagonal), declare how this design maps onto it — which layer/context each component belongs to (`arch-clean-architecture`, `arch-ddd`). A design that quietly invents a parallel structure is the most expensive kind of drift.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Design is a waste, just prototype" | A page of components and flows is cheaper than the second rewrite of the prototype. |
| "We'll pick the NFRs during implementation" | NFRs chosen during implementation are the ones the marketing page promised you didn't read. |
| "Trade-off analysis is overkill" | Without it, every decision is re-litigated by the next teammate who prefers option A. |
| "The happy path is what users see" | Users see the failure path — and so does the on-call rotation. |

## Red Flags

- Design with no NFRs or with NFRs stated but never referenced by decisions
- Components with overlapping responsibilities or no ownership boundaries
- No diagram of data/control flow that a reviewer can trace a request through
- Decisions with no recorded alternatives or no accepted-cost line
- Failure behavior absent ("we'll add retries later")
- A design that contradicts the established architecture style without saying so

## Verification

- [ ] NFR constraints stated up front and referenced by the decisions they bind
- [ ] Components one-responsibility each, ownership boundaries named, dependencies via interfaces
- [ ] Data and control flow drawn, including failure paths
- [ ] Each material decision has alternatives, deciding forces, and accepted cost
- [ ] Failure behavior designed per dependency; degrade paths stated
- [ ] Mapping to the architecture style declared (layer/context per component)
- [ ] Artifact is small enough to review — a few pages, traceable