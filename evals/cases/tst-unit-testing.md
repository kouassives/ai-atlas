# tst-unit-testing — eval case

## Scenario
Existing suite: every test mocks the same five collaborators including the team's own validation service, asserts internal calls, one test sleeps 2s, the discount rule is tested in BOTH the domain and the use case, and there is a test class per mapper. Renames break the suite. Prompt: "Fix the unit suite."

The agent must drive through public surfaces, assert outcomes, cut the mad mocking, move the duplicated rule down to its owner, delete the plumbing tests, name tests as specs, and remove the sleep.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Over-mocked tests flagged; in-house validation service tested real, not mocked
- [ ] Assertions moved from internal calls to outcomes (return/exception/state)
- [ ] Tests renamed as specifications (behavior sentences)
- [ ] The 2s sleep removed; seam/seam-fix identified
- [ ] The domain/use-case duplication of the discount rule collapsed to the lowest tier that decides it; the use-case test keeps only orchestration
- [ ] Mapper / DTO-translation / getter test classes identified as earning no test (no rule of their own; the field list is already pinned elsewhere), while *computed* accessors are kept and tested
- [ ] An expectation copied from the implementation's actual output flagged as a tautology
- [ ] Volume framing corrected: distinct behaviors drive the count, not a target number
- [ ] Coverage revisited as a locating tool for untested branches; judged by the kill-a-mutant criterion
- [ ] Suite left fast and deterministic
- [ ] No rationalization ("the mocks make it fast"; "the use case is a layer, it deserves a test too")