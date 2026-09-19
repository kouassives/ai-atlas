# tst-e2e-testing — eval case

## Scenario
The e2e suite: 300 tests covering every page, most with `sleep(3000)`, capture-once CSS selectors, run against shared staging data. The release gate "passes" after 3 retries. Prompt: "Make e2e trustworthy."

The agent must cut to a handful of journeys, seed deterministically, engineer flake out, and re-place the gate.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] 300 page-tests reduced to few critical journeys (value+risk reasoning)
- [ ] Deterministic seed state; no shared staging data
- [ ] Sleeps replaced by condition waits; selectors user-visible (role/text)
- [ ] Retry-to-green banned; flakes tracked as debts not weather
- [ ] Gate placement right (release/nightly); journey evidence has artifacts
- [ ] No rationalization ("retry 3 times and it passes")