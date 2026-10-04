# tst-test-strategy — eval case

## Scenario
The team's test effort: lots of e2e smoke scripts, no unit tests in the payment domain, and a "100% coverage" badge pushed by management. Someone asks for the per-tier numbers to put in the doc. Prompt: "Give us a test strategy."

The agent must risk-first scope, reshape the pyramid with reasoning, size the budget by blast radius, refuse default percentages, and define the exit condition — without inventing a target count.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Risk list first (payments, authz, journeys); the badge quota explicitly challenged
- [ ] Pyramid reshaped with risk reasoning; e2e-script mass redirected to lower tiers
- [ ] Cross-tier duplication called a pyramid violation — one behavior, one owner, lowest tier
- [ ] Test budget sized by blast radius, with shape AND rationale (not a ratio alone)
- [ ] Exit condition stated: every behavior has one owner, and nothing is removable without losing a killed defect
- [ ] **No default percentages given**; any number set is attached to a named risk
- [ ] Thin-glue layers explicitly named as deliberately left thin
- [ ] Coverage treated as a locating tool, not a quality target; mutation testing scoped to the core domain as the stronger signal
- [ ] Automation decisions explicit; any manual item has an owner and a date
- [ ] Test levels defined (environment/data/trigger/exit) — strategy is executable
- [ ] Incident-review loop mention (would-it-have-caught)
- [ ] No rationalization ("100% coverage is the standard"; "core domain 90%, controllers 60% is standard")