---
name: fnd-adr
description: "Writes and maintains Architecture Decision Records (ADRs) with the record template and the status lifecycle (proposed, accepted, superseded). Use when a decision must be recorded or written down, when you need to write or record why a design choice was made, when the team must track decisions about technologies or structure, or when revisiting and recording a reversal of an old decision."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: foundation
  sdlc-stage: design
  version: 1.0.0
---

# Architecture Decision Records

## Overview

An ADR is a short, dated, immutable record of a decision: the context that forced it, the decision itself, and the consequences. Its purpose is to capture the **why** while it is still cheap to capture — so that six months later, a reader (human or agent) does not have to reverse-engineer intent from code.

## When to Use

- A decision changes the system structurally: technology choices, module boundaries, data ownership, protocols, library replacements, re-architectures.
- Someone asks "why is it built this way?" and the answer lives only in someone's head.
- Two or more options were genuinely considered — a decision by default still deserves a record.
- Reversing or amending a prior decision (write a NEW ADR that supersedes the old one).

**When NOT to use:**

- Routine implementation choices with no lasting impact (naming, formatting, which helper to call).
- Decisions that can be fully reversed in a day without cost.
- Documenting state ("we use Postgres") without a decision context — that's system state, supersede it by recording the decision that produced it.

## Process

### Step 1 — Decide if this is ADR-worthy

Cost to reverse ≠ value of the record. If the question "why" would embarrass the team in three months, it's ADR-worthy. When in doubt, write it — one page is cheap insurance.

### Step 2 — Place it

Keep ADRs in a dedicated directory: `docs/adr/`. Use the sequence-based filename pattern so ordering holds forever:

```
docs/adr/0001-modular-monolith-boundaries.md
docs/adr/0002-event-bus-selection.md
```

### Step 3 — Write it with this template (keep under one page)

```markdown
# ADR-0001: <Title: decision in a sentence>

## Status
Proposed | Accepted | Superseded by ADR-00XX

## Context
The forces at play: what problem forced the decision, constraints,
tensions, and alternatives considered. Facts only; no decision yet.

## Decision
One or two sentences: "We will <do X>." State what changed, and what
explicitly did NOT change.

## Consequences
Positive: what this decision buys. Negative: what it costs, debts it
incurs, and what would force a revisit.
```

### Step 4 — Manage the lifecycle honestly

- **Proposed** → **Accepted** only after the decision is actually committed to (merged, deployed), not when it feels right.
- Never edit an accepted ADR's history. A change in direction is a **new ADR** that supersedes the old one; the old record stays as history.
- List supersessions in both records (old → "Superseded by ADR-00XX", new → "Supersedes ADR-00XX").

### Step 5 — Reference it where the code changes

When implementing an accepted ADR, the PR description and key comments should link the ADR number. That link is what makes an ADR findable from code.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We don't have time to document decisions" | The missing record is re-litigated at the next equivalent decision — twice the meeting, half the context. |
| "Everyone knows why we chose X" | "Everyone" changes teams. Code doesn't. |
| "I'll write it after the refactor" | After the refactor, the context that forced the decision is already half-gone. |
| "An ADR is bureaucracy" | One page, dated, immutable: it is the cheapest senior-engineering artifact that exists. |

## Red Flags

- Accepted ADRs silently edited: history must stay immutable.
- ADRs that describe state ("we use Kubernetes") without a decision and consequences.
- A directory with only accepted decisions and no proposed or superseded ones — no one is revisiting anything, which is itself a smell.
- Decisions repeated across multiple ADRs instead of one superseding chain.

## Verification

- [ ] A place for ADRs exists (`docs/adr/`) and is linked in the README
- [ ] The decision is one page or less: Status, Context, Decision, Consequences
- [ ] Name pattern `<NNNN>-<kebab-title>.md` and numbered sequentially
- [ ] Status reflects reality (Accepted only once committed)
- [ ] Supersessions are cross-linked both ways
- [ ] The implementing PR references the ADR number