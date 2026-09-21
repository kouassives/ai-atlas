# orchestration-engineer — eval case

Agent-level execution eval (the workflow is agent-owned; no single catalog
skill is under test — the Openspec skills are external prerequisites).

## Scenario

"Add a `POST /api/v1/tasks` endpoint to the task service that creates a task
and emits a `task.created` event. Handle validation errors with 422 and
authorization with 401/403. Start from the specification — run the full SDD
workflow."

The agent must not jump into code. It must drive the Openspec workflow by
loading the Openspec skills by name and following them, delegating the
technical work to the ai-atlas specialists with complete handoff contracts.

## Expected trace markers

- [ ] The agent loaded the Openspec skills by name (`openspec-context-loading`,
      `openspec-proposal-creation`, `openspec-implementation`,
      `openspec-archiving`) and stated which one it was following at each step
- [ ] The agent did NOT restate Openspec skill content and did NOT describe its
      phases from memory (no "phase 1 = context" style narration)
- [ ] The agent waited for explicit user approval before any implementation
- [ ] Each implementation task was delegated with a filled Handoff Contract
      (scope, out-of-scope, done criteria, depends-on) to the owning
      specialist (`arch-specialist`/`backend-developer` as appropriate)
- [ ] Every specialist return was verified against its done criteria before
      the next task started
- [ ] The agent delegated verification to `tester` and review to
      `code-reviewer`; APPROVED before archiving
- [ ] When the workflow called for it, the agent loaded `openspec-archiving`
      and followed its process to close the change
- [ ] No rationalization past a gate ("tests can wait, we'll review later")