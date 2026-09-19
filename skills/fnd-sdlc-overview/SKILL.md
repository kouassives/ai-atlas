---
name: fnd-sdlc-overview
description: "Maps the full software development lifecycle: which stage a request belongs to, which role owns it, which skills apply, and the exit criteria for handing off between stages. Use when starting a new project, when a request spans multiple phases, when the team is unsure what should happen next, or when deciding which specialist agent or skill applies to a task."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: foundation
  sdlc-stage: analysis
  version: 1.0.0
---

# SDLC Overview

## Overview

The software development lifecycle is a sequence of stages from discovery to operations. Every request you receive belongs to (at least) one stage, and each stage has an owning role, a set of applicable skills, and **exit criteria** that must be met before the next stage starts. This skill is the router: it tells you which skill or agent to apply when the stage of work is unclear.

## When to Use

- Starting a brand-new project or feature and need the full map of what happens next.
- A request spans multiple stages ("build me the whole thing") and needs decomposition.
- Deciding which specialist agent (architect, backend, frontend, ui, tester, devops) should own a task.
- The team disagrees about what should happen before code is written.

**When NOT to use:**

- A request is already scoped to ONE stage and ONE clear competency — apply that skill directly, do not widen the scope.
- A trivial mechanics task ("rename this variable", "fix this typo").

## Process

### Step 1 — Classify the request into a stage

| Stage | Owning role | What exits the stage |
|---|---|---|
| **Discovery** | UI Designer + Architect | A problem statement, target user, and success metric |
| **Analysis / Requirements** | Architect | Requirements: user stories, acceptance criteria, explicit non-goals |
| **Design / Architecture** | Architect | An architecture: components, boundaries, NFRs, ADRs for key decisions |
| **UI / UX design** | UI Designer | Flows, wireframes, and a visual design that implements the requirements |
| **Implementation** | Backend / Frontend developers | Working code with tests, per the design |
| **Testing / QA** | Tester | Evidence the build meets the acceptance criteria |
| **Build / CI** | DevOps | An artifact that is reproducibly built and verified |
| **Deploy** | DevOps | The artifact live in the target environment, rollback ready |
| **Ops / Maintenance** | DevOps + all roles | The system observable, monitored, and patchable |

Identify the *earliest* stage the request touches. If it touches more than one, the earliest stage owns it — later stages are downstream.

### Step 2 — Name the owning role and the skills to apply

- Architect stages → `arch-*` skills (requirements-analysis, system-design, ddd, clean-architecture…)
- Backend implementation → `be-*` skills
- Frontend implementation → `fe-*` skills
- UI design → `ui-*` skills
- QA → `tst-*` skills
- Build/deploy/ops → `ops-*` skills
- Any stage, when a cross-cutting concern appears (review, ADR, security, docs) → `fnd-*` skills

### Step 3 — Check the exit criteria of the current stage before moving on

Do not advance to the next stage until the current one's exit criteria are met (see the table above). If the previous stage's exit criteria are missing (e.g. no requirements before implementation), stop and surface that gap — do not silently invent the missing artifact.

### Step 4 — Hand off with a passable artifact

When the stage is complete, the handoff artifact must be self-contained: the next role must be able to pick it up without a conversation. If the artifact is missing pieces, say so explicitly instead of proceeding.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It's a small feature, I'll just build it" | Small features still have requirements, design, tests, and review. Skip the ceremony, not the gates. |
| "We'll figure out the requirements as we code" | Discovery during implementation is rework at 10x the cost. |
| "The user asked for everything, so start with code" | The stages are dependencies, not suggestions. The first missing artifact decides the first stage. |
| "I know what a dashboard looks like, no need for a designer" | You skipped Discovery/Requirements; the exit criteria you are missing are exactly the ones that define success. |

## Red Flags

- Code being written before requirements or design exist.
- A stage marked "done" with no artifact (no spec, no design, no tests).
- Agents being applied to stages they do not own (e.g. a tester writing the architecture).
- Handoff artifacts that require a meeting to be understood.

## Verification

- [ ] The request is classified into exactly one owning stage (the earliest it touches)
- [ ] The owning role and its skills are identified
- [ ] The current stage's exit criteria are checked — explicitly
- [ ] Missing upstream artifacts are surfaced to the user, not invented
- [ ] The handoff artifact is self-contained and named