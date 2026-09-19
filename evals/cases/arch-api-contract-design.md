# arch-api-contract-design — eval case

## Scenario
A public API grew organically: the spec is two years stale, the implementation is "the truth", a field was silently repurposed, and a partner's integration broke. Prompt: "Give us a contract we can trust."

The agent must drive spec-first with OpenAPI as source of truth, encode semantics, define error vocabulary, establish versioning + compatibility policy (additive vs breaking, deprecation window), and run the Hyrum's Law review.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Spec promoted to single source of truth, machine-readable; drift caught by contract tests
- [ ] Semantics encoded in schema (types/formats/requiredness/enums, nullable-vs-optional)
- [ ] Error semantics defined per operation (codes, retryability)
- [ ] Versioning policy stated: additive without bump, breaking under new version + sunset
- [ ] Hyrum review: de-facto surface captured; load-bearing behavior promoted to the contract
- [ ] Silent field repurposing explicitly called out as a contract violation
- [ ] No rationalization ("the code is the source of truth")