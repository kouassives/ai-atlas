# ai-engineer

Production-grade **skills** and **agents** for AI coding assistants (OpenCode-first, Agent Skills standard), covering the full software development lifecycle — organized by SDLC role.

> **Status: under construction.** Architecture locked, foundation skills in progress. 54 skills planned.

## Why this collection

Most collections optimize for one stack (JS/TS, web) or one cultural context. `ai-engineer` covers the **engineering fundamentals** — Clean Architecture, DDD, SOLID, design patterns, microservices, testing, DevOps — in a **language- and stack-agnostic** way, organized by SDLC role:

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

Documentation pending — standards-compliant `skills/<name>/SKILL.md` layout:

```bash
# once published (owner placeholder):
npx skills add <owner>/ai-engineer
```

Or place a skill folder into `.opencode/skills/` (project) / `~/.config/opencode/skills/` (global) and restart OpenCode. Agents ship in `agents/` → `.opencode/agent/`.

## Security statement

Skills are instructions — treat downloaded skills like executable code. Review before installing, and pin installed versions. This collection ships no executable scripts inside skills and its CI enforces a content security lint. Releases are tagged with checksums.

## Roadmap

1. **L0** Scaffolding (this) — ✅
2. **L1** Foundation skills (`fnd-*`)
3. **L2** Pilot domain: developer-backend (`be-*`) + `backend-developer` / `code-reviewer` agents
4. **L3–L7** architect, devops, tester, frontend, ui-designer domains + agents
5. **L8** Hardening: `install.sh`, marketplace manifests, execution evals, docs

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design.

## License

MIT — see [LICENSE](LICENSE). Contributions welcome, see [CONTRIBUTING.md](CONTRIBUTING.md).