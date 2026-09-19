# Execution evals (Tier 3)

Behavioral verification of a skill inside a **real OpenCode session** — not just structure (Tier 1) or routing (Tier 2).

## Anatomy of an eval case — `cases/<skill-name>.md`

```markdown
# <skill-name> — eval case

## Scenario
<one realistic task that should trigger the skill>

## Expected trace markers
- [ ] The agent loaded the skill when the scenario matched
- [ ] The agent applied step N of the Process (name it)
- [ ] The agent produced the Verification checklist and ticked it
- [ ] The agent did NOT rationalize past a step (no "I'll do it later")
```

## How to run

Manual, documented procedure (see `docs/usage.md#eval`):

1. Create a scratch project with the skill installed (`.opencode/skills/<name>/`).
2. Run OpenCode with the scenario as the first prompt.
3. Grade the trace against the markers — all boxes must tick.

CI runs only Tier 1 + Tier 2 automatically. Tier 3 is a **release gate**: no skill ships without a passing execution eval (build plan L8 sweep).

## Rules

- One case file per skill. File name = skill name.
- Scenarios must be reproducible (no external services), or explicitly marked `[requires: <external>]`.
- A case that fails three times in a row forces a skill revision, not a case rewrite.