# arch-ddd — eval case

## Scenario
Two teams: "Sales" and "Support" both manage "Customer" but mean different things; a legacy CRM feeds a raw customer table everyone reads directly. Prompt: "Sort out the domain model."

The agent must build the ubiquitous language, separate bounded contexts, keep Customer distinct per context, design aggregates/roots, domain events for crossings, and an anti-corruption layer for the legacy feed.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Glossary of ubiquitous language produced; two-meaning terms split per context
- [ ] Bounded contexts drawn with ownership; no shared Customer model across them
- [ ] Aggregates designed with roots, small boundaries, ID references
- [ ] Domain events named in the language, published via integration layer
- [ ] Anti-corruption layer specified for the legacy CRM with mapping tests
- [ ] No rationalization ("one shared table is simpler")
- [ ] Verified against a domain expert story