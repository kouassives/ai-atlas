# ai-engineer

Production-grade **skills** and **agents** for AI coding assistants (OpenCode-first, Agent Skills standard), covering the full software development lifecycle — organized by SDLC role.

> **Status: in progress.** Architecture locked. Foundation + backend + architect + devops + tester + frontend skills published (48/54). Agents begun. UI-design domain next.

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
2. **L1** Foundation skills (`fnd-*`) — ✅ *(sdlc-overview, engineering-principles, code-review, adr, security-basics, technical-writing)*
3. **L2** Pilot domain: developer-backend (`be-*`) — ✅ *(solid-principles, api-design, microservices-patterns, database-design, async-messaging, security-engineering, performance, tdd, refactoring)* + `backend-developer` / `code-reviewer` agents + shared `definition-of-done`
4. **L3** architect domain (`arch-*`) — ✅ *(requirements-analysis, system-design, ddd, clean-architecture, design-patterns, microservices-architecture, api-contract-design, nfrs)* + `arch-specialist` agent
5. **L4** devops domain (`ops-*`) — ✅ *(ci-cd, docker-containers, kubernetes, iac-terraform, gitops, observability, monitoring-alerting, devsecops, release-management)* + `devops-engineer` agent
6. **L5** tester domain (`tst-*`) — ✅ *(test-strategy, test-design-techniques, unit-testing, integration-testing, e2e-testing, api-testing, performance-testing, regression)* + `tester` agent
7. **L6** frontend domain (`fe-*`) — ✅ *(architecture, component-design, state-management, api-integration, accessibility, responsive-design, performance, security)* + `frontend-developer` agent
8. **L7** ui-designer domain (`ui-*`) + `ui-designer` agent
9. **L8** Hardening: `install.sh`, marketplace manifests, execution evals, docs

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design.

## License

MIT — see [LICENSE](LICENSE). Contributions welcome, see [CONTRIBUTING.md](CONTRIBUTING.md).