# tst-test-strategy — eval case

## Scenario
The team's test effort: lots of e2e smoke scripts, no unit tests in the payment domain, and a "100% coverage" badge pushed by management. Prompt: "Give us a test strategy."

The agent must risk-first scope, reshape the pyramid with reasoning, set per-tier evidence-backed coverage, and decide automation vs manual with owners.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Risk list first (payments, authz, journeys); the badge quota explicitly challenged
- [ ] Pyramid reshaped with risk reasoning; e2e-script mass redirected to lower tiers
- [ ] Coverage goals per tier tied to the risk they protect
- [ ] Automation decisions explicit; any manual item has an owner and a date
- [ ] Test levels defined (environment/data/trigger/exit) — strategy is executable
- [ ] Incident-review loop mention (would-it-have-caught)
- [ ] No rationalization ("100% coverage is the standard")