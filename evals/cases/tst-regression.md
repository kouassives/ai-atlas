# tst-regression — eval case

## Scenario
A regression escaped to production two weeks after a refactor, the suite is 1500 tests that "all run" on every PR (takes an hour), and 5 tests are retried-to-green. Prompt: "Make the net trustworthy."

The agent must build the protection map, introduce change-linked selection, add the incident test, and fix the flakes as debt.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Protection map labels (behavior/risk/criticality) introduced
- [ ] Selection policy: affected + touched seams + crossing journeys + fast baseline; full-suite cadence defined
- [ ] The escaped regression produced its test (incident-loop made concrete)
- [ ] Retry-to-green banned; 5 flaky tests entered backlog with owners
- [ ] Suite speed budget set; slow tests tier-migrated
- [ ] Flake rate tracked as a metric
- [ ] No rationalization ("it passed on the third retry")