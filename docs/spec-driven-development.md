# Spec-Driven Development in ai-atlas

This document defines the SDD workflow executed by the `orchestration-engineer`
primary agent. The workflow is owned by the **agent** (persona + routing +
gates) and the **skills are referenced by name, never copied** — the Openspec
skills are installed globally by the user, and the technical depth comes from
the ai-atlas catalog skills.

## Prerequisites

The four Openspec skills must be installed on the machine running the agent:

- `openspec-context-loading`
- `openspec-proposal-creation`
- `openspec-implementation`
- `openspec-archiving`

They live outside this repository (`~/.config/opencode/skills/openspec-*`).
The agent references them by name; ai-atlas does not vendor them.

## Workflow

```
        ┌────────────────────────────────────────────────────────────┐
        │  orchestration-engineer  (one feature, end to end)          │
        └────────────────────────────────────────────────────────────┘

 1. CONTEXT   openspec-context-loading  + fnd-sdlc-overview
 2. PROPOSAL  openspec-proposal-creation + arch-requirements-analysis
            │  (sharpening: arch-system-design, arch-nfrs,
            │   arch-api-contract-design, be-api-design,
            │   be-database-design as needed)
            ▼  user approval gate — no implementation before approval
 3. PLAN      tasks extracted from the proposal, one handoff contract each
 4. IMPLEMENT openspec-implementation + delegation to specialists
            │  arch-specialist / backend-developer / frontend-developer /
            │  ui-designer / devops-engineer — each with a handoff contract
            ▼  per-task done criteria verified
 5. VERIFY    tester (tst-*) — evidence over promises
 6. REVIEW    code-reviewer (fnd-code-review) — APPROVED or targeted loops
 7. ARCHIVE   openspec-archiving — merge spec delta into living spec
```

## Phase exit criteria

| Phase | Entry | Exit criteria |
|---|---|---|
| **1. Context** | Feature request | Agent can answer: what exists, what must change, which spec/capability files are in play (`openspec-context-loading` checklist done) |
| **2. Proposal** | Context complete | Spec delta written in `spec/changes/<change>/proposal.md` with context, forces, constraints, capability deltas; acceptance criteria explicit; **user approved** |
| **3. Plan** | Approved proposal | One task per work item; every task carries a filled Handoff Contract (scope, out-of-scope, done criteria, depends-on) |
| **4. Implement** | Plan complete | Every specialist returned `DONE` with evidence (tests run, commands executed) for every task |
| **5. Verify** | All tasks DONE | `tester` returned PASS against the proposal's acceptance criteria |
| **6. Review** | Verify PASS | `code-reviewer` returned APPROVED; max 2 loops per specialist, then escalate |
| **7. Archive** | Review APPROVED | `openspec-archiving` completed: delta merged into living spec, change closed |

## Delegation rules

- Architecture / structural work → `arch-specialist` (`arch-*` skills)
- Backend implementation → `backend-developer` (`be-*` skills)
- Frontend implementation → `frontend-developer` (`fe-*` skills) — any UI design
  decision passes through `ui-designer` (`ui-*` skills) **before** implementation
- Test suites / test strategy → `tester` (`tst-*` skills)
- CI/CD, infra, deployment → `devops-engineer` (`ops-*` skills)
- Review → `code-reviewer` (`fnd-code-review`)

The agent never restates skill content. It states *which* skill owns which
phase and *who* receives the handoff.

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

1. **Gates in order** — clarity → architecture → UI → implementation →
   integration → testing → review → archive. State the gate before delegating.
2. **Loop with precision** — a failed gate returns to the specialist with the
   exact diff of what must change. Max 2 loops per specialist; then escalate
   to the user with the two failure reports.
3. **Proof over promises** — every specialist reports what was run and what was
   verified. A "done" without evidence returns to the specialist.
4. **Security is non-negotiable** — any security concern found at any phase
   goes straight to `code-reviewer` (`fnd-security-basics` is the floor).
5. **Stop on scope creep** — flag undeclared scope to the user before
   continuing; never implement beyond the approved proposal.
6. **Integrate, never silo** — when multiple specialists touch one shared
   contract, the interface is agreed before parallel work starts.
7. **Spec is the source of truth** — code must satisfy the proposal; if code
   contradicts the spec, either the code or the proposal must change — never
   silently both.

## Evaluation

Execution eval case: `evals/cases/orchestration-engineer.md` (Tier 3, manual
release gate). The scenario drives one feature through the full workflow and
grades the trace against the phase exit criteria above.