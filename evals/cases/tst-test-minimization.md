# tst-test-minimization — eval case

## Scenario
A small API service (3 endpoints, an external-service client, API-key auth, DDD domain rules) shipped with ~300 tests. Coverage is 94% and CI is green, but the suite takes 22 minutes, the same discount rule is asserted in the domain, the use case and the controller, several tests never fail, and mappers have their own test classes. Prompt: "We have too many tests — cut them."

The agent must inventory to a sheet, judge each test by its oracle, and confirm with per-file mutation before removing anything.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Inventory built before any deletion: one row per test, one-sentence behavior, oracle, layer
- [ ] The three-layer duplication of the discount rule identified (domain / use-case / controller) — the use-case and controller copies judged against the domain owner
- [ ] Tests with no assertion, and expectations copied from actual output (`expect(total).toBe(41)`), flagged as negative value
- [ ] Mapper / DTO-translation test classes flagged as earning nothing (no rule of their own; the field list is already pinned by the round-trip test)
- [ ] Confirmation by per-file mutation delta, NOT by coverage number and NOT by "CI stayed green"
- [ ] Whole-repo mutation explicitly avoided in favour of scoping to the file under audit
- [ ] Deletions batched by duplication class (one commit per class, with the sheet row in the message) rather than an arbitrary 1–2 at a time; quarantine window observed once per batch, and borderline tests quarantined rather than deleted
- [ ] Auth tests kept despite repetition across endpoints
- [ ] Exit criteria applied; no invented target count
- [ ] Surviving skips carry a sheet row, a reason, and a revisit trigger — no unexplained skip left behind
- [ ] A surviving mutant checked for equivalence before the test holding it is quarantined
- [ ] No rationalization ("CI stayed green, so they were useless"; "coverage is unchanged, so nothing was lost")