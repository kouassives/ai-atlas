---
name: ui-ux-flows
description: "Maps screens to tasks: user flows, information architecture, wireframes, and journey mapping. Use when mapping screens to tasks, when navigation structure is unclear, or when features exist without a path through them."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: ui-designer
  sdlc-stage: design
  version: 1.0.0
---

# UX Flows, IA, and Wireframes

## Overview

Before any visual design, UX flows answer "how does the user move from intent to outcome?": **user flows** (task paths, including alternatives and dead ends), **information architecture** (how content and screens are grouped and named), and **wireframes** (structure of each screen — hierarchy, layout, content — without decoration). The journey map keeps the emotional and effort curve of the whole task in view, so design optimizes the journey, not just single screens.

## When to Use

- New feature: establishing the paths between screens before building.
- Navigation/IA unclear, or users "get lost" (support tickets, dropoffs).
- A screen exists, but no one can describe the task it completes.
- Redesign: the flows are re-mapped before the pixels (`ui-visual-design`).

**When NOT to use:**

- Single-screen polish of an existing, mapped flow (go to visual design).
- The flow exists and the question is purely component-level (`fe-component-design`).

## Process

### Step 1 — Map the user flows first

- Start from the user's intent (from research personas, `ui-ux-research`), not from the app's menu: "book a trip", "report a problem".
- Draw every path: happy path, alternatives, and the dead ends (missing data, permission failures, offline). Flows are honest only when they include the unhappy paths.
- One task per flow; a flow that spans five apps is fine, but a screen with five unrelated tasks is an IA problem, not a flow problem.

### Step 2 — Structure the information architecture

- Group screens/content by user mental models ("where would a user EXPECT this"), not by the org chart or the DB schema.
- Name things the way users name them (evidence, not internal jargon); IA naming is navigation copy — wrong names are how search needs rescue.
- Depth vs breadth: keep key task starts in 1–2 clicks; burying core tasks three levels deep is an IA failure even if the screens are pretty.

### Step 3 — Wireframe each screen's structure

- Wireframes show structure: content hierarchy, layout blocks, the primary action, empty and error states — in grayscale, no typography/style decisions yet.
- Wireframe the states, not just the happy render: loading, empty, error, partial (a screen is a system of states — `fe-api-integration` will implement what this skill sketches).
- Each wireframe carries the flow step(s) it serves; an orphan screen is either missing a flow or missing delete.

### Step 4 — Keep the journey map in view

- A journey map plots effort/emotion across the whole task (before, during, after). The happy-path click-count is one axis; frustration moments (form walls, waits, dead ends) are the other.
- Optimize the peaks of effort, not the shiniest screen. If the "checkout redesign" made the cart prettier but the delivery-date uncertainty remains, the journey did not improve.

### Step 5 — Validate the flows before visual design

- Walk the flows against the personas and the research open-questions; walk the unhappy paths aloud ("then what?" is the test).
- The output is reviewable by stakeholders and testable later: flows + IA + wireframes are the skeleton `ui-visual-design` dresses — and the reference `tst-e2e-testing` measures the real journeys against.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Skip flows, go straight to mockups" | Mockups without flows optimize screens nobody can reach coherently. |
| "IA mirrors our internal structure" | The org chart and the user's model of your product are different maps. |
| "Only the happy path matters at this stage" | The unhappy paths are where users judge the product — and file tickets. |
| "Wireframes waste time before the real design" | Wireframes are the cheapest place to disagree; visuals are the most expensive. |
| "It's just one more screen" | One more screen without a flow step is navigation drift. |

## Red Flags

- Screens designed with no owning flow; flows that end in "user gives up"
- IA named in internal jargon; core tasks buried 3+ levels
- Wireframes without empty/error/loading states
- Happy-path-only journey maps; frustration moments unplotted
- Visual design started before flow review ("just make the mockup")
- No tie between flows and the research personas/evidence

## Verification

- [ ] User flows drawn per intent, including alternatives and dead ends
- [ ] IA grouped by user mental model; names are user words; key tasks ≤ 2 clicks
- [ ] Wireframes per screen with hierarchy, primary action, and empty/error/loading states
- [ ] Every wireframe linked to a flow step; no orphans
- [ ] Journey map includes effort/frustration, not just click counts
- [ ] Flows validated against personas and open questions before visual design