# Per-tool install

`ai-atlas` ships `skills/` in the standard Agent Skills layout
(`skills/<name>/SKILL.md`) plus an `agents/` core for OpenCode.

## OpenCode

### `npx skills add` (recommended, once published)

```bash
npx skills add kouassives/ai-atlas                  # all skills
npx skills add kouassives/ai-atlas --skill fe-security
npx skills add kouassives/ai-atlas --list
```

The skills CLI discovers the flat `skills/` layout directly and writes each
tool's native directory. Agents are **not** installed by the CLI — add them
with `install.sh` or manually:

```bash
install.sh --agent opencode   # global, -> ~/.config/opencode/agent/
install.sh --project          # project, -> ./.opencode/agent/ (skills too)
```

or manually: copy `agents/*.md` → `.opencode/agent/`.

### `install.sh` fallback (no dependencies)

```bash
./install.sh                      # global → ~/.config/opencode/
./install.sh --project            # project → ./.opencode/
./install.sh --agent claude-code  # other tools
./install.sh --list | --dry-run   # preview
./install.sh --force              # overwrite differing files
```

Idempotent; never deletes unknown files; each run prints the manifest.

## Claude Code

Skills are compatible: Claude Code auto-loads `skills/**/SKILL.md`
(`~/.claude/skills/` global, `.claude/skills/` project).

```bash
./install.sh --agent claude-code            # global → ~/.claude/skills/
./install.sh --agent claude-code --project  # → ./.claude/skills/ + ./claude/agents/
```

Agents are copied to `~/.claude/agents/` (Claude Code subagents) — verify
your Claude Code version reads that folder.

## Codex / Cursor

```bash
./install.sh --agent codex    # → ~/.codex/skills/
./install.sh --agent cursor   # → ~/.cursor/skills/
```

## Marketplace manifests (phase 2)

`scripts/emit-marketplace.mjs` regenerates from the filesystem — single
source of truth:

- `registry.yaml` — the full skill + agent inventory (skills with domain,
  agents with mode).
- `.claude-plugin/marketplace.json` — Claude Code plugin marketplace
  (`/plugin marketplace add <repo-url>`), one plugin per skill.
- `.agents/plugins/marketplace.json` — Codex marketplace manifest.

> Status: emitted and CI-fresh, but path layouts are finalized per tool's
> plugin scanner at first tagged release. For reliable installs today use
> `npx skills add` (published) or `install.sh`/manual copy. Review each
> manifest with the tool's docs before advertising `/plugin marketplace add`.

## Verification after any install

Open a session in a project with the skills configured and ask a question
that names one skill verbatim (e.g. "Apply the fe-security skill checklist
to this component"). If the agent loads the skill and follows its process,
discovery works. `scripts/test-install.sh` automates this check for the file
layout.