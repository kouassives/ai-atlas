# tst-unit-testing — eval case

## Scenario
Existing suite: every test mocks the same five collaborators including the team's own validation service, asserts internal calls, and one test sleeps 2s. Renames break the suite. Prompt: "Fix the unit suite."

The agent must drive through public surfaces, assert outcomes, cut the mad mocking, name tests as specs, and remove the sleep.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Over-mocked tests flagged; in-house validation service tested real, not mocked
- [ ] Assertions moved from internal calls to outcomes (return/exception/state)
- [ ] Tests renamed as specifications (behavior sentences)
- [ ] The 2s sleep removed; seam/seam-fix identified
- [ ] Coverage revisited as a probing tool for untested branches
- [ ] Suite left fast and deterministic
- [ ] No rationalization ("the mocks make it fast")