# tst-api-testing — eval case

## Scenario
The API suite asserts only status codes, skips authZ-per-resource, and a validation change shipped that broke clients. The spec says what the response SHOULD be. Three endpoints: one low-risk read, one state-changing, one exposing another principal's data. The domain tests already cover the discount arithmetic. Prompt: "Referee this API."

The agent must classify endpoints by blast radius, assert schema against the spec, cover authN/authZ systematically, apply the technique toolbox only where risk earns it — and exclude rules the domain already owns.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Each endpoint classified by blast radius BEFORE cases are written; case count justified against its class
- [ ] Low-risk read held at the floor (happy path + auth + response shape) instead of a full boundary matrix
- [ ] Status-only assertions upgraded to schema-validated responses (spec validator)
- [ ] AuthZ-per-resource cases: user A vs user B's resource denied asserted
- [ ] AuthN variants: invalid, expired, revoked, malformed, missing tokens
- [ ] Edge coverage applied to the high-risk endpoints only (boundaries, decision tables, state transitions)
- [ ] The domain-owned discount rule EXCLUDED from the surface set — the API asserts status/schema/error translation, not the arithmetic
- [ ] Downstream failures return contracted errors, not naked 500s
- [ ] CI contract gate wired pre-merge
- [ ] No rationalization ("200 is enough"; "every endpoint deserves the full boundary matrix")