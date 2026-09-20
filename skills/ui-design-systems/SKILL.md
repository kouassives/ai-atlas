---
name: ui-design-systems
description: "Creates and extends design systems: design tokens, component libraries, theming, and documentation. Use when creating or extending a design system, when buttons and colors drift between screens, or when a visual language needs codification into tokens and components."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: ui-designer
  sdlc-stage: design
  version: 1.0.0
---

# Design Systems

## Overview

A design system is the visual language of the product made **codified**: design tokens (the single source for color, space, type, radius, motion), a component library (the reusable units, `fe-component-design` shapes the code, this skill defines the system), **theming** (one codebase, many brands/environments via token swapping), and documentation that makes the system a working contract. The system's enemy is drift — and its medicine is being used by real screens.

## When to Use

- Buttons, colors, and spacing drift between screens; the same "primary button" looks different in four places.
- A new visual language exists (from `ui-visual-design`) and needs codification.
- Multiple products/brands share a codebase and need theming.
- New components should ENTER the system (naming, tokens, docs, ownership).

**When NOT to use:**

- A single-screen visual decision (`ui-visual-design` decides it; the system records it later once repeated).
- Codifying a system that has not been visually designed — tokens encode decisions; they do not make them.

## Process

### Step 1 — Extract the token layer first

- **Design tokens** are the primitive vocabulary: color/role, spacing scale, type scale, radius, shadows, motion — each with a semantic name (`color.text.muted`, `space.4`, `radius.md`), NOT a value name (`color.blue`, `size.medium` is borderline — semantic beats sentiment).
- Tokens are the ONLY place raw values live. Implementations (components) reference tokens; a raw hex in a component is drift with a timestamp.
- Start from the verified visual system (`ui-visual-design` verification), not by inventing tokens that fit existing mess — that cryptographizes the drift.

### Step 2 — Codify the component library as a contract

- Each component in the library is a contract: API (props/events, per `fe-component-design`), tokens used, states (default, hover, focus, error, disabled, loading), a11y behavior (`fe-accessibility`), responsive behavior (`fe-responsive-design`), and usage rules (when to use/not use, dosage).
- A component with undocumented states is a component whose states will be reinvented per screen — with different colors each time.
- Two competing "almost the same" components are a new shared component waiting to be extracted; the system tracks the merge, not the duplication.

### Step 3 — Make theming a token-level operation

- Theming swaps token VALUES at a scope (theme/context), not components or styles sprinkled with overrides. One component codebase, N visual identities.
- Themes are explicit: a theme manifest listing the token overrides, verified for contrast/a11y parity (`fe-accessibility`), not "we apply some overrides and hope".
- Theming must not be the permission slip for drift: a theme override with no manifest entry is a banned pattern.

### Step 4 — Document what to use, why, and when not

- Component docs contain: purpose, API, visual states, usage dos/donts, and the alternatives (including "don't use this, use the layout primitives"). Usage guidance is what turns a library into a system.
- Tokens documented with rationale (why this scale/ratio) so future designers extend the system instead of breaking it.
- The system has ownership: one owner/team decides what enters; without ownership, every team's emergency component enters.

### Step 5 — Keep the system honest with real usage

- The system is only as good as its consumption: new screens build from tokens + library; drift is caught (audits, lint on raw values, visual regression tests — `tst-regression` for the UI).
- The feedback loop is two-way: a repeated one-off component is evidence the system is missing a capability — extraction is scheduled, not forbidden.
- Versioning and migration: token/component changes ship with a changelog and a migration path; systems die by silent breaking changes.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We'll codify the design when we have time" | Drift compounds; every screen is a renegotiation of the same button. |
| "Tokens with value names are simpler" | `color.blue` tells you nothing about why; semantics make the system navigable. |
| "One more duplicate component is fine" | A duplicate is a fork; every fork doubles future design change costs. |
| "Theming is just some CSS overrides" | Overrides are drift wearing a theming costume. |
| "Everyone can add to the system" | Everyone adding is the system's design-by-committee death. |

## Red Flags

- Raw values (hex, px) inside components instead of tokens
- Components with undocumented states; "almost the same" duplicates
- Theme overrides without manifest/ownership; a11y parity unchecked
- Docs without usage guidance or alternatives
- No system owner; no drift detection (audits/lint/visual regression)
- Silent breaking changes to tokens/components

## Verification

- [ ] Token layer extracted with semantic names; raw values only in tokens
- [ ] Component library is a documented contract (API, states, a11y, responsive, usage)
- [ ] Theming via token manifests with verified a11y parity
- [ ] Docs include purpose, dos/donts, and alternatives; rationale recorded
- [ ] Ownership defined; drift detection in place
- [ ] Additions enter via the defined process; migration paths documented