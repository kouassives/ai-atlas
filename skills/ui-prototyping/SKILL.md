---
name: ui-prototyping
description: "Prototypes design ideas: fidelity levels, interactive mockups, and validation with users. Use when testing design ideas cheaply, when the design is unvalidated and building the real thing is expensive, or when stakeholders need to react to something concrete."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: ui-designer
  sdlc-stage: design
  version: 1.0.0
---

# Prototyping

## Overview

Prototyping is the art of **buying answers at the cheapest fidelity that can give them**: a sketch answers "is the concept right?", a wireframe flow answers "is the path clear?", an interactive mockup answers "is the interaction obvious and pleasant?". The fidelity ladder is climbed deliberately — each level costs more to build and answers deeper questions — and every prototype is validated with users or stakeholders before the next level. A prototype's job is to be thrown away.

## When to Use

- The design idea is unvalidated; the real implementation is expensive.
- Design alternatives need an A/B before committing.
- Stakeholders need to react to something concrete — a prototype settles meetings that documents never will.
- Feasibility/UX risk needs retiring cheaply before `fe-*` implementation.

**When NOT to use:**

- The question is implementation, the design is validated (go build it).
- A test of the real system is what is needed (`tst-e2e-testing`, `ui-usability-testing` — a prototype is not a test run).

## Process

### Step 1 — Pick the fidelity that answers the question

| Fidelity | Answers | Best for |
|---|---|---|
| Sketch/paper | Concept, layout instinct | First framing, 5-minute ideas |
| Wireframe flow | Path clarity, IA sanity | `ui-ux-flows` validation |
| Static mockup | Visual direction | Stakeholder direction pick |
| Interactive mockup | Interaction clarity, task completion | The "does it feel right" question |

- Match fidelity to the decision pending — a full interactive mockup for a concept that is still a sketch is money spent on the wrong question.
- The rule: **the cheapest level that can still answer the question** — and note which level you validated at.

### Step 2 — Build interactive only where interaction is the question

- Interactive mockups exist to test task flow, affordance, and reaction — not to demo polish. They carry realistic content, realistic states (empty/error), and a bounded set of paths (the tested flows, not the whole app).
- A click-through that dead-ends on "and then this feature" is a prototype that sold the demo and failed the validation. Every path a user can walk must be complete in the prototype.

### Step 3 — Validate with users and record honestly

- Prototypes are validation instruments: run tasks with users (see `ui-usability-testing` for the session craft), collect WHERE they hesitated or failed — not applause.
- Present prototypes to stakeholders as decision surfaces (sample real options, capture the pick), not as "the design is done" announcements.

### Step 4 — Throw the prototype away deliberately

- The prototype is evidence, not the blueprint: the decisions migrate (to `ui-visual-design`, `ui-design-systems`, `fe-*`), the artifact goes. Keeping the prototype as "almost the app" creates the world's worst implementation spec.
- Write the findings record: what was validated, what changed, what was abandoned and why — so the prototype's value outlives the artifact (`fnd-adr`).

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We'll just make it in the real codebase, we're agile" | Real-code is the most expensive prototype medium; you cannot throw it away. |
| "A high-fidelity mockup is more convincing" | Convincing is not validing; the fidelity must answer the question, not impress the room. |
| "Prototypes are for demoing to stakeholders" | If nobody behavioral-tested it, it is an animated brochure. |
| "We'll evolve the prototype into the product" | Evolving prototypes bypass the design system and every code quality gate. |
| "We don't have time to prototype" | Time to prototype is the discount on the rebuild you are not budgeting for. |

## Red Flags

- Prototyping in the production codebase
- High fidelity before the lower-level questions are answered (mockup of a concept that was never framed — `ui-ux-research` missing)
- Interactive paths that end in dead ends; demo-only content
- No behavioral validation; stakeholder applause as the only evidence
- Prototype dressed as a deliverable and migrated instead of thrown away
- No findings record; decisions undocumented

## Verification

- [ ] Fidelity chosen to answer the pending question (cheapest that answers it)
- [ ] Interactive only where interaction is the question; all walkable paths complete; states included
- [ ] Validated with real users/stakeholders; hesitations recorded, not applause
- [ ] Findings record written (validated / changed / abandoned)
- [ ] Prototype thrown away deliberately; decisions migrated to design/implementation
- [ ] No rationalization-based fidelity inflation