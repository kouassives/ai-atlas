# Spec-Driven Development in ai-atlas

This document describes what the `orchestration-engineer` primary agent adds
around the Openspec workflow. **The workflow itself is owned by the Openspec
skills — referenced by name, never copied, never restated.**

## Prerequisites

The four Openspec skills must be installed on the machine running the agent:

- `openspec-context-loading`
- `openspec-proposal-creation`
- `openspec-implementation`
- `openspec-archiving`

They live outside this repository (`~/.config/opencode/skills/openspec-*`).
The agent references them by name; ai-atlas does not vendor them and does not
redefine their content.

## Division of ownership

| What | Owned by |
|---|---|
| SDD workflow (phases, artifacts, exit criteria) | the Openspec skills — follow them as the source of truth |
| Persona, routing, gates | the `orchestration-engineer` agent |
| Technical depth | the catalog skills (`arch-*`, `be-*`, `fe-*`, `ui-*`, `tst-*`, `ops-*`, `fnd-*`) |

ai-atlas therefore never describes the Openspec phases. If the Openspec
workflow changes, this document stays valid — the agents keep loading the
skills by name and the skills carry the update.

> **Rule:** the agent states *which* Openspec skill it is following and *who*
> receives the handoff. It never restates what the skill says.

## Delegation rules (ai-atlas additions)

- Architecture / structural work → `arch-specialist` (`arch-*` skills)
- Backend implementation → `backend-developer` (`be-*` skills)
- Frontend implementation → `frontend-developer` (`fe-*` skills) — any UI design
  decision passes through `ui-designer` (`ui-*` skills) **before** implementation
- Test suites / test strategy → `tester` (`tst-*` skills)
- CI/CD, infra, deployment → `devops-engineer` (`ops-*` skills)
- Review → `code-reviewer` (`fnd-code-review`)

## Handoff Contract template (mandatory per delegation)

```
## Handoff Contract
- **Task ID**        : <short unique label>
- **Context**        : decisions made so far (proposal ref, architecture choices)
- **Exact scope**    : files / endpoints / components / domains in play
- **Out of scope**   : what must NOT be touched
- **Deliverable**    : what the specialist must return
- **Done criteria**  : objective, checkable conditions (e.g. "returns 200 on valid input")
- **Constraints**    : tech stack, patterns, conventions, performance targets
- **Depends on**     : prior Task IDs whose output this task uses
```

A delegation without a complete Handoff Contract is invalid.

## Operating rules

1. **Skills win** — when the agent file and a loaded Openspec skill disagree,
   the skill wins. State which skill is being followed.
2. **Proposal approval is a hard gate** — no implementation before the user
   approves the proposal.
3. **Loop with precision** — a failed gate returns to the specialist with the
   exact diff of what must change. Max 2 loops per specialist; then escalate
   to the user with the two failure reports.
4. **Proof over promises** — every specialist reports what was run and what was
   verified. A "done" without evidence returns to the specialist.
5. **Security is non-negotiable** — any security concern found at any phase
   goes straight to `code-reviewer` (`fnd-security-basics` is the floor).
6. **Stop on scope creep** — flag undeclared scope to the user before
   continuing; never implement beyond the approved proposal.
7. **Integrate, never silo** — when multiple specialists touch one shared
   contract, the interface is agreed before parallel work starts.
8. **Spec is the source of truth** — code must satisfy the proposal; if code
   contradicts the spec, either the code or the proposal must change — never
   silently both.

## Evaluation

Execution eval case: `evals/cases/orchestration-engineer.md` (Tier 3, manual
release gate). The scenario drives one feature through the Openspec workflow
and grades the trace against the division of ownership above.