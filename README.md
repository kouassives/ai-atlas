# ai-atlas

Production-grade **skills** and **agents** for AI coding assistants (OpenCode-first, Agent Skills standard), covering the full software development lifecycle — organized by SDLC role.

> **Status: released.** Architecture locked. All 54 skills + 9 agents published across foundation, architect, backend, frontend, ui-design, tester, and devops domains. Installer, marketplace manifests, full quality suite, and a static catalog site ([GitHub Pages](https://kouassives.github.io/ai-atlas/)) live.

## Why this collection

Most collections optimize for one stack (JS/TS, web) or one cultural context. `ai-atlas` covers the **engineering fundamentals** — Clean Architecture, DDD, SOLID, design patterns, microservices, testing, DevOps — in a **language- and stack-agnostic** way, organized by SDLC role:

| Domain | Prefix | Skills |
|---|---|---|
| Foundation (cross-cutting) | `fnd-` | 6 |
| Architect | `arch-` | 8 |
| Developer Backend | `be-` | 9 |
| Developer Frontend | `fe-` | 8 |
| UI Designer | `ui-` | 6 |
| Tester | `tst-` | 8 |
| DevOps | `ops-` | 9 |

Each skill is **one competency**, self-contained, namespaced to be installable side-by-side with other collections without collisions.

## Install

Standard `skills/<name>/SKILL.md` layout — works with `npx skills add`, every tool's native skill scanner, and the included zero-dependency installer:

```bash
# 1. skills (ecosystem standard, once published):
npx skills add kouassives/ai-atlas

# 2. agents + skills for OpenCode (no dependencies):
./install.sh                      # global → ~/.config/opencode/
./install.sh --project            # project → ./.opencode/
./install.sh --list | --dry-run   # preview
./install.sh --force              # overwrite

# 3. other tools:
./install.sh --agent claude-code  # → ~/.claude/skills/ (+ agents)
./install.sh --agent codex        # → ~/.codex/skills/
./install.sh --agent cursor       # → ~/.cursor/skills/
```

Or place a skill folder into `.opencode/skills/` (project) / `~/.config/opencode/skills/` (global) and restart OpenCode. Agents ship in `agents/` → `.opencode/agent/`. Per-tool details: [docs/usage.md](docs/usage.md).

## Security statement

Skills are instructions — treat downloaded skills like executable code. Review before installing, and pin installed versions. This collection ships no executable scripts inside skills and its CI enforces a content security lint. Releases are tagged with checksums.

## Roadmap

1. **L0** Scaffolding (this) — ✅
2. **L1** Foundation skills (`fnd-*`) — ✅ *(sdlc-overview, engineering-principles, code-review, adr, security-basics, technical-writing)*
3. **L2** Pilot domain: developer-backend (`be-*`) — ✅ *(solid-principles, api-design, microservices-patterns, database-design, async-messaging, security-engineering, performance, tdd, refactoring)* + `backend-developer` / `code-reviewer` agents + shared `definition-of-done`
4. **L3** architect domain (`arch-*`) — ✅ *(requirements-analysis, system-design, ddd, clean-architecture, design-patterns, microservices-architecture, api-contract-design, nfrs)* + `arch-specialist` agent
5. **L4** devops domain (`ops-*`) — ✅ *(ci-cd, docker-containers, kubernetes, iac-terraform, gitops, observability, monitoring-alerting, devsecops, release-management)* + `devops-engineer` agent
6. **L5** tester domain (`tst-*`) — ✅ *(test-strategy, test-design-techniques, unit-testing, integration-testing, e2e-testing, api-testing, performance-testing, regression)* + `tester` agent
7. **L6** frontend domain (`fe-*`) — ✅ *(architecture, component-design, state-management, api-integration, accessibility, responsive-design, performance, security)* + `frontend-developer` agent
8. **L7** ui-designer domain (`ui-*`) — ✅ *(ux-research, ux-flows, visual-design, design-systems, prototyping, usability-testing)* + `ui-designer` agent
9. **L8** Hardening — ✅ `install.sh` (POSIX-sh, tested) + `test-install.sh`, `orchestrator.md` primary agent, marketplace manifests (`registry.yaml`, `.claude-plugin/`, `.agents/plugins/`), execution-eval coverage check, `release.yml` (tag → SHA256SUMS), docs
10. **L9** Spec-Driven Development — ✅ `orchestration-engineer` primary agent that loads the Openspec skills by name and follows their workflow (never restating it), with delegation to specialists via handoff contracts; `docs/spec-driven-development.md`; static catalog site (`scripts/gen-site.mjs` → `site/`, GitHub Pages via `.github/workflows/site.yml`)

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design.

## License

MIT — see [LICENSE](LICENSE). Contributions welcome, see [CONTRIBUTING.md](CONTRIBUTING.md).