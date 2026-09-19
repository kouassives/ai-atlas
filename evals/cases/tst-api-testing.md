# tst-api-testing — eval case

## Scenario
The API suite asserts only status codes, skips authZ-per-resource, and a validation change shipped that broke clients. The spec says what the response SHOULD be. Prompt: "Referee this API."

The agent must assert schema against the spec, cover authN/authZ systematically, apply boundaries/tables to the surface, and pin the failing shapes.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Status-only assertions upgraded to schema-validated responses (spec validator)
- [ ] AuthZ-per-resource cases: user A vs user B's resource denied asserted
- [ ] AuthN variants: invalid, expired, revoked, malformed, missing tokens
- [ ] Edge coverage: boundaries (page size, lengths), decision tables (filters), state transitions (cancel-after-ship rejected)
- [ ] Downstream failures return contracted errors, not naked 500s
- [ ] CI contract gate wired pre-merge
- [ ] No rationalization ("200 is enough")