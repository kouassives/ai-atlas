---
name: ui-ux-research
description: "Runs user research: interviews, personas, problem framing, and discovery. Use when the target user or problem is unknown, when a feature is being invented without user contact, or when decisions rest on assumptions nobody verified."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: ui-designer
  sdlc-stage: discovery
  version: 1.0.0
---

# UX Research

## Overview

Research exists to replace assumptions with evidence about who the users are and what problem they actually have. It is the cheapest de-risking in product work: an interview week beats a build quarter aimed at a ghost. This skill covers the discovery loop: **framing the problem** (not the solution), **interviews** (not surveys of opinions), and **personas** (usable summaries, not posters). Research output is a decision tool, not a deliverable that decorates a drive.

## When to Use

- Target user or problem unknown; the "build what we assume" risk is high.
- Stakeholders disagree about who the product is for.
- A feature was idea-validated on vibes and nobody has met a user.
- Before any significant design investment (wireframes, prototypes, implementation).

**When NOT to use:**

- The problem and user are known and you need design execution (`ui-ux-flows`, `ui-visual-design`).
- The gate is already passed: research findings exist and the question is implementation.

## Process

### Step 1 — Frame the problem before the solution

- Write the problem hypothesis the product will test: user, pain, context, and why it matters. The frame is wrong if it contains the solution ("users need a dashboard" is a solution; "users cannot tell if their job ran" is a problem).
- List the assumptions the product depends on and rank them by risk — the riskiest assumption is the research question, not the nicest one.

### Step 2 — Interview users, don't survey opinions

- **Interviews**: 5–8 per user segment, open-ended, on behavior and past events ("tell me about the last time you…"), free of leading questions and product-selling. Record and transcribe.
- **Surveys** are for confirming distribution of a known behavior at scale — not for discovering problems; "would you use this?" over a form is fiction (`tst-test-design-techniques` does not apply here: this is not a test, it is an inquiry).
- Never interview only your own team, your friends, or the sales list — recruit the actual or adjacent segment.

### Step 3 — Distill into personas that are decision tools

- A persona is: name, role/context, goals, pains, workarounds, and the trigger situations where the problem bites. It is NOT demography theater (age, city, "likes coffee") — demographics without behavior do not steer design.
- Each persona carries the evidence trail (quotes/batches of transcripts) so anyone can check the claim. One to three personas; more means the frame was too broad.

### Step 4 — Record what you did NOT learn

- Write the open questions and the segments you did not reach. An un-interviewed segment is a future product surprise — mark it as risk, not as validated.
- Surprising findings (the user contradicts the assumption) get written up as the headline, not buried: disconfirmation is the whole point of research.

### Step 5 — Hand the frame to design

- Output = problem statement + personas + open questions, reviewed against the goal before any wireframe. Design now works from evidence; `ui-ux-flows` turns the frame into flows, `ui-prototyping` tests it cheaply.
- The ADR/fnd record: research decisions (recruit, method, findings) get a dated note so future "who are our users?" discussions start from evidence (`fnd-adr`).

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We know our users, we ARE the users" | The team is the most reliable blind spot in product history. |
| "Surveys are faster than interviews" | Surveys discover opinions about your idea; interviews discover the problem. |
| "Personas are fluffy posters" | Bad personas are posters; evidence-tied personas are decisions. |
| "Shipping fast beats researching" | Speed on the wrong problem is the most expensive speed there is. |
| "We'll talk to users after launch" | Then launch validated the assumptions you never checked. |

## Red Flags

- Solution-shaped problem statements ("we need a…" as the frame)
- Surveys/interviews of your own team; recruited-only-friends sessions
- Personas with demographics but no behavior, pains, or evidence
- No open-questions list; disconfirming findings buried
- Research done after the design is already committed
- Zero user contact before heavy design/build investment

## Verification

- [ ] Problem framed without the solution; riskiest assumptions ranked
- [ ] Interviews run (5–8/segment, transcribed), not opinion surveys
- [ ] Personas are decision tools: behavior + pains + evidence, 1–3 max
- [ ] Open questions and un-reached segments written as risk
- [ ] Findings handed to design; surprising data is the headline
- [ ] No "we are the user" rationalization in the record