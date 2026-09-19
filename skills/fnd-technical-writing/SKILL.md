---
name: fnd-technical-writing
description: "Writes technical documentation that survives: READMEs, API documentation, inline comments, and changelogs — with the right structure for each and rules that keep docs from rotting. Use when writing or improving a README, documenting an API or module, reviewing documentation quality, writing a changelog, or when a teammate asks 'how do I use this?' and there is no answer written down."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: foundation
  sdlc-stage: operations-maintenance
  version: 1.0.0
---

# Technical Writing

## Overview

Documentation fails in one of two ways: it doesn't exist, or it drifts from reality. Both are solved by the same rules: write for a named reader, structure each document type, and treat documentation as code — reviewed, tested, and maintained in the same change as the code it describes.

## When to Use

- Writing or improving a README, API reference, module guide, or onboarding doc.
- A "how do I use this?" question that has no written answer.
- Reviewing docs as part of a change (docs should change WITH code).
- Writing or maintaining a changelog.

**When NOT to use:**

- Copywriting or marketing material.
- Re-documenting obvious code ("increments the counter") — that's noise.

## Process

### Step 1 — Name the reader and the task

Every document answers one reader's task: *"how do I install this?"*, *"what does this API contract guarantee?"*, *"why is the system shaped this way?"*. Write the task at the top of the document. If a document serves two readers, split it.

### Step 2 — README: top-down, actionable

The README is a funnel — the first 10 lines decide whether the reader stays:

1. **What it is** (one sentence) and the problem it solves.
2. **Install** in the fewest commands, copy-pasteable.
3. **Quick start**: the minimal working example, runnable.
4. **Usage**: common operations with examples.
5. **Config / API surface**: table-form, one line per option, defaults stated.
6. **Development / contribution**, **license**, **links**.

Never require a search for the install command. Every command in a README should be citable by a link/anchor.

### Step 3 — API docs: contract before prose

Document the **contract**: inputs with types and ranges, outputs, error semantics, and idempotency — before describing motivation. For each endpoint/function:

```markdown
### `POST /orders`
Create an order. Idempotent via `Idempotency-Key`.
- **Auth**: `Bearer` token, `orders:write` scope
- **Body**: `{ "items": [{ "sku": string, "qty": int 1..99 }] }`
- **200**: order created (see Order object)
- **409**: duplicate idempotency key; **422**: validation failed
```

Errors are part of the contract: document status codes, error shapes, and retry semantics.

### Step 4 — Comments: the why, never the what

An inline comment explains what the code cannot: *why* this branch exists, *which* invariant is being protected, *what* trap was avoided. "Increments i" is noise; "skip entries older than the retention window" is a why. When a comment describes what, the code should be rewritten to say it instead.

### Step 5 — Changelog: Keep a Changelog discipline

- One `Unreleased` section at the top; per-release sections below, dated, in reverse order.
- Group by type: **Added / Changed / Deprecated / Removed / Fixed / Security**.
- Entries are user-visible sentences ("The CLI now retries failed uploads with backoff"), not internal notes.
- A changelog entry ships with the change — never batched at release time from memory.

### Step 6 — Test the docs

Treat docs like code: after writing them, follow your own instructions from a clean state (fresh session, no prior context) and fix whatever fails. If a command in the docs cannot be run in CI, mark it as such or remove it.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The code is self-documenting" | Code shows the what, not the why or the contract. READMEs and API docs still die. |
| "I'll document it when it stabilizes" | "Stabilizes" never arrives; docs written later are reconstruction, not documentation. |
| "Docs are a separate PR" | Docs that land separately land late, and late docs are written from memory. |
| "A comment explains the workaround" | Good — only if it states WHY the workaround exists and the condition under which it can be removed. |

## Red Flags

- README with no install section or commands that don't run
- API docs without error semantics
- Comments repeating the code line they annotate
- Docs describing behavior the code no longer has (drift — fix in the same change)
- Changelog written from memory at release time

## Verification

- [ ] The reader and their task are stated
- [ ] README follows the funnel; install commands are copy-pasteable
- [ ] API contract documented: inputs, outputs, errors, idempotency
- [ ] Comments explain why/invariants only; code bears the re-readability
- [ ] Changelog entry added for the change, correct section and tense
- [ ] The docs were executed from a clean state (or the unexecuted parts are labeled)