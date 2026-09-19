# arch-microservices-architecture — eval case

## Scenario
A 3-team monolith wants to "become microservices" — the stated driver is "monoliths are slow to release". Current state: one shared DB, one shared model per domain. Prompt: "Plan the split."

The agent must interrogate the motivation, propose bounded-context boundaries, declare exclusive data ownership per service, count the consistency windows, seriously consider the modular monolith default, and produce the ADR.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Honest motivation analysis; "monolith is slow" tested against real bottlenecks
- [ ] Boundaries from bounded contexts; no context split across services
- [ ] Data ownership line per service; shared DB explicitly resolved
- [ ] Cross-service flows mapped; consistency windows counted and justified
- [ ] Modular monolith considered as default; rejection reason recorded if rejected
- [ ] ADR recommended with boundaries, ownership table, accepted costs
- [ ] No rationalization ("we'll just add services slowly")