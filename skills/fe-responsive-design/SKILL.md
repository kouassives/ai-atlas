---
name: fe-responsive-design
description: "Builds layouts that work across viewports: mobile-first, fluid layout, breakpoints, and container queries. Use when styling across viewports, when a design works on desktop but breaks on mobile, or when breakpoint stacks grow unmanageable."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: frontend
  sdlc-stage: implementation
  version: 1.0.0
---

# Responsive Design

## Overview

Responsive design is the discipline of a layout that adapts by layout system, not by device enumeration. CSS has the tools: **fluid sizing** so content flows, **breakpoints** for the places where the layout's structure must change (not for every component width), and **container queries** for components that adapt to their placement, not just the viewport. The mobile-first habit keeps the base simple and the enhancement progressive.

## When to Use

- Styling new layouts or components across viewports.
- A page that works on desktop and breaks on phones (or vice versa).
- Breakpoint stacks that multiply ("we added a 480px because the 500px case didn't fit") and nobody can change them.

**When NOT to use:**

- Desktop-only admin tools with a stated and enforced desktop scope (state it; responsive is not free).
- Designing the visual system itself (spacing/type scale) — that is `ui-visual-design`.

## Process

### Step 1 — Mobile-first, base styles are the phone

- Write the base (unqueried) styles for the small viewport: the essential layout, legible type, tappable targets. Media queries then ENHANCE (min-width): grids expand, panoramas unlock.
- Mobile-first forces the content-first question: what does this UI look like with the least width? That is the honest base, and it keeps desktop as an enhancement rather than the source of truth.

### Step 2 — Fluid, and then break structurally

- **Fluid first**: flexbox/grid with `minmax`, `fr`, percentage/intrinsic sizing, `clamp()` for type, and `auto-fit/auto-fill` grids let content reflow continuously — breaking the page into columns only where the layout genuinely needs a structural change.
- **Breakpoints are structural**: they change layout structure (one column → two, header collapses → navigation moves), not cosmetic spacing. If a breakpoint exists because "a card looked slightly off", that is a fluid-layout bug, not a missing breakpoint.
- A short breakpoint list (2-3 structural points) that everyone trusts beats a long one nobody can edit.

### Step 3 — Let components adapt to their container

- Container queries make a component adapt to its **container's** width, not the viewport — reusable cards, panels, and sidebars behave correctly in any slot.
- This is the difference between "I put this in the sidebar so it must fit the sidebar rules" and "this component owns its rules everywhere it lands".
- When layout requires container context (grids nested in grids), CQs beat viewport guessing.

### Step 4 — Handle the awkward spaces deliberately

- Long unbreakable content (URLs, code, words) — `overflow-wrap`, `min-width: 0` on grid/flex children (the classic overflow bug: a child's intrinsic width pushes the viewport).
- Images/media: `max-width: 100%` everywhere; art direction via `srcset/picture` for real performance (`fe-performance` covers the budget).
- Touch targets stay ≥ tappable size at the small viewport (`fe-accessibility` target guidance).

### Step 5 — Verify on the real spectrum

- Test: small phone, large phone, tablet portrait/landscape, laptop, desktop + zoomed-in (200% zoom is a viewport of ~640px at 200% — the responsive work covers it) + landscape on small phones (height-constrained layouts).
- Verify with real viewport sizes, not "tilt the DevTools window until it breaks" — the break is where structure changes, and the checks confirm the structure holds at the corners.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We design desktop-first; mobile is a smaller desktop" | Mobile is not a smaller desktop; it is the base with fewer assumptions. |
| "One more breakpoint for this card" | Breakpoint creep is how the list becomes an unownable stack. |
| "Fixed pixel widths are fine, nothing important is on mobile" | Nothing important = assumption; check the analytics, not the feelings. |
| "Container queries are new, viewport works" | The nav works until the component lands in the sidebar. CQs are the ownership fix. |
| "It works in Chrome DevTools mobile mode" | Emulation is a hint; the real spectrum includes height, zoom, and orientation. |

## Red Flags

- Desktop-first base with mobile as a "fix" media query
- Breakpoints added for spacing/cosmetic deltas; long unowned stacks
- Fixed-width layouts, pixels everywhere, no fluid sizing
- Grid/flex children overflowing (no `min-width: 0`, intrinsic-width bugs)
- Images/media without `max-width: 100%`
- No verification at zoom, landscape, or small-phone corners

## Verification

- [ ] Base styles are mobile-first; queries enhance (min-width only)
- [ ] Fluid sizing first; breakpoints structural, short, and owned
- [ ] Container queries used where components must adapt to placement
- [ ] Overflow handled (unbreakable content, min-width:0, media max-width:100%)
- [ ] Real-spectrum verification: phones/tablet/desktop + zoom + landscape
- [ ] Desktop-only scope, if claimed, is stated and enforced