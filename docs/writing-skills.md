# Writing skills — author handbook

How to write a skill that passes the quality bar. Conventions are normative —
the CI lint (`scripts/lint-skills.mjs`) enforces them mechanically.

## Before you write

- **One skill = one competency.** If you reach for "…and also", split.
- Read 2–3 existing skills first (model your grain on them).
- Check the routing index (`SKILLS.md`) — you must NOT collide with an existing trigger vocabulary.

## The template

```markdown
---
name: <prefix>-<kebab-name>
description: "<What it does>. <Triggers a real user might type, front-loaded>. Use when <situation>."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: <foundation|architect|developer-backend|developer-frontend|ui-designer|tester|devops>
  sdlc-stage: <discovery|analysis|design|ui-design|implementation|testing|build|deploy|ops-maintenance>
  version: 1.0.0
---

# <Skill Name>

## Overview
2–5 lines: what it does, why it matters, when it pays off.

## When to Use
- Trigger bullets — the situations that should load this skill.
- …

**When NOT to use:**
- Anti-triggers — adjacent situations where this skill must stay quiet.

## Process
1. Step, with concrete thresholds ("~100 lines", "80/15/5").
2. Include a before/after example where it clarifies.
3. …

## Common Rationalizations
| Excuse an agent gives to skip a step | Reality |
|---|---|
| "I'll add the tests later." | Later never comes. Verification is the gate. |

## Red Flags
- Signs the skill is being applied wrong, or skipped.

## Verification
- [ ] Checkboxes the agent ticks — evidence-based exit criteria.
- [ ] "Seems right" is never sufficient.

## References
Optional. Relative links ONLY to `references/` inside this skill's folder.
```

## Rules that matter (non-negotiable)

| Rule | Why |
|---|---|
| `name` = folder name, lowercase-hyphen, ≤ 64 chars | Strict OpenCode loader |
| Domain prefix in name: `fnd- arch- be- fe- ui- tst- ops-` | Anti-collision with other collections |
| `description` in English, 2–3 sentences, **user words front-loaded**, ends "Use when…" | This is the ONLY thing the model sees for routing — it must contain what users actually type |
| `When NOT to use` block present | Anti-trigger discipline — the #1 trait of a well-written skill |
| Self-contained: no links to `../`, no root `references/`, no sibling skills | Per-skill install must not break (agent-skills #361 bug, solved by design here) |
| Markdown only inside the folder: `SKILL.md`, `references/*.md` (+ `assets/` optional) | Sharable across every harness |
| ≤ 200 lines in `SKILL.md` | Token budget; depth goes in `references/` |
| No exfiltration / secret-collection / `curl … \| sh` instructions | Security lint (Tier 1) |

## Depth: progressive disclosure

`SKILL.md` is the always-loaded entry point. Anything deep (checklists,
reference tables, detailed examples) goes into `references/` inside the skill
folder and is read **on demand**. Budget: the agent should "know" the skill
after 200 lines and load the rest only when a step needs it.

## Before submitting (your local checklist)

1. `node scripts/lint-skills.mjs` → no errors (warnings acceptable on first pass)
2. Added ≥ 1 routing prompt for the skill in `evals/routing/prompts.json`
3. `node scripts/eval-routing.mjs` → PASS (no collisions)
4. `node scripts/gen-index.mjs` → SKILLS.md regenerated
5. Write the Tier 3 execution eval case: `evals/cases/<skill-name>.md`
6. Test the skill once in a real OpenCode scratch project (`.opencode/skills/<name>/`)