---
name: fnd-code-review
description: "Conducts multi-axis code review: correctness, readability, architecture, security, and performance, with severity labels, change-sizing guidance, and a verdict. Use before merging any pull request or change, when reviewing code written by yourself, another agent, or a human, or when assessing whether a change is ready to enter the main branch."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: foundation
  sdlc-stage: review
  version: 1.0.0
---

# Code Review

## Overview

A change is reviewed across five axes, findings are labeled by severity, and the verdict is **Approve** when the change clearly improves overall code health — not when it is perfect. Perfect code doesn't exist; blocking a change because it isn't how you would have written it is a review failure, not rigor.

## When to Use

- Before merging any PR or change (non-negotiable gate).
- When another agent or model produced code you must evaluate.
- After a bug fix (review the fix AND the regression test).
- Before a refactor is merged.

**When NOT to use:**

- Writing or fixing code — this skill review only.
- Deep security analysis or pentesting — that is `fnd-security-basics` / `be-security-engineering`.
- Performance profiling itself — that is `be-performance` / `fe-performance`.

## Process

### Step 1 — Understand intent before code

What is the change trying to accomplish, per the spec or task? A review out of context is a checklist noise generator.

### Step 2 — Review the tests first

Tests reveal intent and coverage. Do tests exist? Do they test behavior rather than implementation details? Are edge cases covered? Would they catch a regression?

### Step 3 — Walk the code on five axes

1. **Correctness** — matches the spec? edge cases (null, empty, boundary)? error paths, not just the happy path? concurrency/state issues?
2. **Readability** — descriptive names, straightforward control flow, no "clever" tricks, comments only for non-obvious intent; **abstractions must earn their complexity** (never generalize before the third use case)
3. **Architecture** — follows existing patterns (or justifies new ones), clean boundaries, dependencies flow one way (no cycles), refactor reduces complexity rather than relocating it
4. **Security** — user input validated at boundaries, secrets out of code and logs, parameterized queries, output encoded (XSS), external data treated as untrusted; see `fnd-security-basics`
5. **Performance** — N+1 queries, unbounded loops or fetches, sync-in-async, unnecessary re-renders, missing pagination

### Step 4 — Label every finding by severity

| Prefix | Meaning | Author action |
|---|---|---|
| *(none)* | Required | Must address before merge |
| **Critical:** | Blocks merge | Vulnerability, data loss, broken functionality |
| **Nit:** | Minor, optional | May ignore (style, formatting) |
| **Optional:/Consider:** | Suggestion | Weigh it |
| **FYI** | Informational | No action |

Order findings by leverage: correctness and security first, structural issues next, nits last. Lead with what matters — a few high-conviction comments beat a long list.

### Step 5 — Verify the verification story

What tests were run? Did the build pass? Manual verification? Screenshots for UI changes? If the story is missing, request it. **"LGTM" without evidence is not a review.**

### Step 6 — Size the change

- ~100 lines changed → reviewable in one sitting.
- ~300 lines → acceptable only as one logical change.
- ~1000 lines → too large; ask for a split (stacked, by file group, horizontal, or vertical strategies).
- Separating refactoring from feature work is required — a change that refactors AND adds behavior is two changes.

### Step 7 — Give the verdict

**Approve** when the change improves overall code health; otherwise **Request changes** with the specific blockers (Critical / unlabeled findings) named. Handle disagreements by the hierarchy: facts and data > style guide > software design principles > codebase consistency.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It works, that's good enough" | Working code that is unreadable, insecure, or structurally wrong compounds debt. |
| "I wrote it, so it's correct" | Authors are blind to their own assumptions. |
| "AI code is probably fine — it's tested" | AI output needs MORE scrutiny: it is confident, plausible, and wrong in invisible ways. |
| "The tests pass, so it's good" | Tests don't catch architecture, security, or readability problems. |
| "I'll clean it up later" | Deferred cleanup almost never happens — the review gate is the last chance. |

## Red Flags

- Merging without review, or "LGTM" without evidence of review
- Review that only checks tests pass
- Comments without severity labels (everything looks mandatory)
- Accepting "I'll fix it later"
- A refactor that moves code around without reducing reader-held concepts
- Bulk dependency bumps merged with no changelog review ("bump deps")

## Verification

- [ ] Intent understood (spec/task stated)
- [ ] Tests reviewed first; coverage judged, not counted
- [ ] All five axes evaluated — explicitly
- [ ] Findings labeled by severity; blockers named
- [ ] Verification story documented (tests/build/manual)
- [ ] Change size assessed; oversized changes sent back for splitting
- [ ] Verdict given: Approve, or Request changes with named blockers