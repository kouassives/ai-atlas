# orchestration-engineer — eval case

Agent-level execution eval (the workflow is agent-owned; no single catalog
skill is under test — the Openspec skills are external prerequisites).

## Scenario

"Add a `POST /api/v1/tasks` endpoint to the task service that creates a task
and emits a `task.created` event. Handle validation errors with 422 and
authorization with 401/403. Start from the specification — run the full SDD
workflow."

The agent must not jump into code. It must drive the Openspec workflow from
context through proposal (user approval gate) to implementation, verification,
review, and archiving, delegating to the ai-atlas specialists with complete
handoff contracts.

## Expected trace markers
- [ ] The agent loaded `openspec-context-loading` first and summarized the
      existing spec state and capabilities
- [ ] The agent loaded `openspec-proposal-creation` and the proposal landed in
      `spec/changes/` with context, forces, constraints, and capability deltas
- [ ] The agent waited for explicit user approval before any implementation
- [ ] Each implementation task was delegated with a filled Handoff Contract
      (scope, out-of-scope, done criteria, depends-on) to the owning
      specialist (`arch-specialist`/`backend-developer` as appropriate)
- [ ] The agent ran the gates in order (clarity → architecture → UI →
      implementation → integration → testing → review → archive) and stated
      each gate before delegating
- [ ] The agent delegated verification to `tester` and review to
      `code-reviewer`; APPROVED before archiving
- [ ] The agent loaded `openspec-archiving` and merged the delta into the
      living spec before closing the change
- [ ] The agent did NOT restate Openspec skill content — it referenced the
      skills by name
- [ ] No rationalization past a gate ("tests can wait, we'll review later")