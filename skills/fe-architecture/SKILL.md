---
name: fe-architecture
description: "Structures frontend codebases: feature-based modules, clean layers, module boundaries, and folder conventions. Use when structuring a frontend codebase, when components and logic sprawl across folders, when scaling adds new features chaotically, or when a frontend needs architecture review."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: frontend
  sdlc-stage: design
  version: 1.0.0
---

# Frontend Architecture

## Overview

Frontend architecture is the answer to "where does this code go, and what may it touch?". The same forces as the backend apply — boundaries, ownership, dependency direction — but with a codebase shaped by UI. This skill establishes **feature-based architecture**: each feature owns its components, logic, and state; shared code lives in a thin platform layer; dependencies point INTO the platform from features, never across features.

## When to Use

- Structuring a new frontend (framework-agnostic) or reorganizing a sprawling one.
- Features keep touching each other's internals (a "shared components" dump).
- The question "where does this live?" has no stable answer.
- Reviewing frontend structure for boundaries and dependency direction.

**When NOT to use:**

- Building a tiny one-off page (single feature, no architecture needed — YAGNI).
- Choosing the framework itself or its build tooling.

## Process

### Step 1 — Organize by feature, not by type

- Folder per feature: `features/<feature>/` containing that feature's components, hooks/logic, and local state. Co-location beats type-folders: "components/ + hooks/ + utils/" dump everything unrelated into one pile.
- A feature is a slice of user capability (checkout, settings, search) — its files change together and travel together.
- Naming a feature well is the architecture: a name that covers two unrelated things is two features pretending to be one.

### Step 2 — Draw the layers: platform vs features

```text
app/ (composition, routing, bootstrap)
features/<feature>/{components,logic,state}   ← features may use platform
platform/ (ui primitives, design tokens, http, auth, dev utils)
```

- **Platform** provides shared primitives; features compose them.
- **Features do not depend on each other**: a cross-feature need is either lifted to the platform (if truly shared) or handled by the app layer (if it is orchestration). Dependency arrows: app → feature → platform. Never feature → feature.

### Step 3 — Keep module boundaries honest

- A feature's public surface is its entry point (exported component/hook); everything else is private to the folder — enforce via folder conventions/lint boundaries.
- The barrel/directory is the boundary: if importing requires knowing a feature's internals, the boundary is leaking.
- Feature size is bounded by change frequency: when two "features" must always change together, they are one feature.

### Step 4 — Route with the app layer, compose with features

- Routing, providers, and app-level state wiring live in the app layer — features render where they are routed, they do not own the app.
- Lazy-load features at the route boundary (this also pays the performance budget — see `fe-performance`).
- Passing data between features via app/orchestration state is explicit; a feature reaching into another feature's store to set flags is a boundary violation.

### Step 5 — Make the structure testable

- Logic is separated from views (hooks/composables/business utilities) so unit tests target logic without DOM ceremony (`tst-unit-testing` applies the pyramid to frontend).
- Feature folders are testable in isolation (their deps are platform or injected).
- A component with its business logic embedded becomes an untestable unit and a boundary smell — extract the logic per `fe-component-design`.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "components/ + hooks/ + utils/ is the standard" | Type-folders make "where does this live?" a recurring question; features answer it once. |
| "This helper is small, import it from the other feature" | Small cross-feature imports are how boundaries rot one file at a time. |
| "Reuse means sharing everything" | Sharing the platform is reuse; sharing feature internals is coupling. |
| "Our app is too small for architecture" | Small apps grow; the folder convention is the cheapest architecture there is. |
| "We'll restructure during the rewrite" | The rewrite is where the same unowned sprawl gets rebuilt. |

## Red Flags

- Type-folders that force cross-folder walks for one feature
- Features importing from other features' internals
- A "shared components" folder that is really five features' castoffs
- Logic embedded in views with no extraction point
- Routing/providers entangled inside feature folders
- No folder-convention enforcement (boundaries by etiquette)

## Verification

- [ ] Feature folders co-locate components/logic/state; type-folders removed or minimal
- [ ] Layers drawn: app → feature → platform; no feature→feature imports
- [ ] Feature public surfaces defined; internals private by convention/enforcement
- [ ] Routing/providers in the app layer; features lazy-loaded
- [ ] Logic separated from views; feature folders testable in isolation
- [ ] "Where does this live?" has one stable answer per artifact