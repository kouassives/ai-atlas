# references/ — shared checklists (documentation only)

⚠️ **Never referenced by skills.**

This directory holds shared checklists (e.g. `definition-of-done.md`) that are
convenient for whole-repo viewers and for the README, but **skills must be
self-contained** (ARCHITECTURE.md §3): a `SKILL.md` may only link to
`references/` *inside its own skill folder*. That rule is what keeps every
skill installable on its own (`npx skills add … --skill X`) without the
portability bug the agent-skills collection hit (their issue #361).

Per-skill depth lives at `skills/<name>/references/`.