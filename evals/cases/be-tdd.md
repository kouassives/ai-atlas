# be-tdd — eval case

## Scenario
A subtle bug: orders with a discount code are charged the wrong total when a second discount applies. There is a test suite but it's all unit tests mocking every collaborator, and the code shape is what the tests assert. Prompt: "Fix the bug."

The agent must write the failing regression test first (watch it fail for the right reason), implement minimally, then refactor under the net — and flag the over-mocked suite.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Regression test written first, failed for the RIGHT reason (discount logic), not compile/fixture error
- [ ] Test name describes behavior, not the method; asserts through public API
- [ ] Minimal honest fix; no test-only prod branches
- [ ] Over-mocking flagged: mocks of in-house collaborators with real logic called out
- [ ] Fix verified: new test green + full suite green
- [ ] No rationalization ("I'll add the test after the fix")