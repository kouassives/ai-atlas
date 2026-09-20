---
name: fe-component-design
description: "Designs UI components: composition, presentational vs container roles, prop and event contracts, and reusability without premature abstraction. Use when building UI components, when a component grows props and conditionals without bound, or when 'reusable' components are actually hard to use and change."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: frontend
  sdlc-stage: implementation
  version: 1.0.0
---

# Component Design

## Overview

Components are the frontend's units of design — and of coupling. Their discipline: **composition over configuration** (small pieces assembled beat a big component with 20 props), separation of **presentational** (how it looks) from **container** (where data comes from) concerns, explicit prop/event contracts, and reusability earned by repetition, not declared in advance.

## When to Use

- Building new components, or refactoring a component too big to reason about.
- A component's props list reads like a feature's requirements (growing without bound).
- Components that "look reusable" but are unused, unreadable, or unchangeable.
- Splitting logic-bearing UI from presentational pieces.

**When NOT to use:**

- One-off markup inside a feature that will never repeat — leave it inside the feature (`fe-architecture`).
- Global design-system atoms belong to the design system (`ui-design-systems`) once repetition proves them.

## Process

### Step 1 — Stratify the roles

- **Presentational**: props in, rendered UI out, no data fetching, no global state, no routing. Pure, dumb, predictable — the reusable surface.
- **Container/logic**: owns data acquisition and state; renders presentational children with the data they need.
- The split is the dependency rule at component scale: presentational components are the "core" (no I/O), containers are the adapters.

### Step 2 — Prefer composition to configuration

- A component with `variant`, `size`, `showHeader`, `layout`, `onMode`… is a config surface that grows forever — assemble small components instead (`<Card><Card.Header>…` beats `<Card variant="with-header" showIcon layout="compact" …/>`).
- Share behavior via composition/children/slots and small wrapper components, not via a prop-per-feature.
- When a new requirement needs a new prop AND a new conditional, the component should usually be split, not extended.

### Step 3 — Make the prop/event contract explicit

- Props are the contract: typed, documented, with sensible defaults; no silent "if you pass both X and Y, Y wins" mystery rules.
- Events flow UP (callbacks/emits describe what happened: `onSubmit`, `onSelect`), state/data flows DOWN. No child reaching into parent state (that is `fe-state-management` scope).
- Boolean-prop proliferation is the first smell of a missing sibling component.

### Step 4 — Reusability is earned

- Reuse when the THIRD instance appears (YAGNI): the first two duplications are usually different enough that early abstraction was wrong.
- The cost side: a "reusable" component has an API to maintain, users to not-break, and abstraction to justify. Repeatable use in the codebase pays that; a predicted use does not.
- If a supposedly-reusable component is only used once but tweaked everywhere, it is a template, not a component — inline the variations.

### Step 5 — Keep the accessibility and responsive contract attached

- Components that render interactive or text-bearing UI carry their semantics (`fe-accessibility`) and viewport behavior (`fe-responsive-design`) as part of their contract — accessibility is not a later wrapper.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "One more prop won't hurt" | The twentieth prop is the one that makes the component unchangeable. |
| "We made it reusable for the future" | The future rewrites it; the present pays the coupling. |
| "Container logic in the component is simpler" | Simpler to write, forever harder to test and change. |
| "Props are documented in the types" | Types document shape, not semantics — defaults, units, and interaction rules belong in words. |
| "This component is shared, put it in platform" | Only after real repetition; a single-use "shared" component is a castle in the air. |

## Red Flags

- Prop lists that grow with every feature (config-compound)
- Components that fetch data and render pixels at the same time
- Events/state flowing down, or children reaching into parent stores
- "Reusable" components with one real user and ten tweaks
- Booleans as a design language (`showX`, `withY`, `hasZ`)
- Accessibility/responsive behavior glued on outside the contract

## Verification

- [ ] Presentational vs container split applied; presentational = pure props-in/UI-out
- [ ] Composition preferred; no config-compound with unbounded props
- [ ] Contract explicit: typed props with documented semantics, events up / data down
- [ ] Reusability earned (third-use rule); single-use "shared" components rejected
- [ ] A11y + responsive behavior part of the component's contract
- [ ] Components testable: logic extracted, presentational renderable in isolation