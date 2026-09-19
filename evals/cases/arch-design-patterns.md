# arch-design-patterns — eval case

## Scenario
Code contains: a factory that constructs exactly one product, an observer with one subscriber, and a proposal to add a "Strategy" because "other systems use it". Prompt: "Review these pattern choices."

The agent must name the problem shapes first, check each pattern's intent against the real problem, propose the simpler idiom where the language offers it, and flag speculative patterns (YAGNI).

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Problem shapes named before naming any pattern
- [ ] Factory-with-one-product / observer-with-one-subscriber flagged as speculative or justified
- [ ] Simpler language idiom considered (closures/functions as strategies) and either taken or rejected with reason
- [ ] Trade-offs recorded for the patterns that stay
- [ ] Anti-pattern shapes (god object, sequential coupling) checked for
- [ ] No rationalization ("it's a classic GoF pattern")