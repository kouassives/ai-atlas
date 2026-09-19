# be-solid-principles — eval case

## Scenario
`OrderProcessor` is 400 lines: it parses CSV, validates, saves to SQL, sends email, and writes logs. There is also `BaseOrderHandler` with two subclasses. Prompt: "Split this class properly."

The agent must apply each SOLID check, produce the before/after decomposition, prefer composition over the hierarchy, and add no speculative abstraction.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Each affected principle named with its smell (SRP verbs, D inversion, L on the hierarchy)
- [ ] Before/after decomposition given: one unit per axis of change, orchestration thin
- [ ] Composition preferred where the base-class hierarchy fails LSP
- [ ] No interface introduced for a single concrete use (YAGNI gate)
- [ ] Dependency arrows verified pointing inward (core imports no infrastructure)
- [ ] No rationalization ("it works, leave it")