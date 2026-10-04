# tst-test-design-techniques — eval case

## Scenario
A discount rule: "members get 10% off orders ≥ 50€; non-members 5% off orders ≥ 100€; order quantity 1-99." The domain tests already cover the discount arithmetic. Prompt: "Derive the test cases for this rule."

The agent must partition the spaces, probe the boundaries the domain does not already own, build the decision table only for combinations the code actually branches on — then trim the candidate set to the smallest discriminating subset.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Equivalence partitions named (member classes, amount classes, quantity classes, valid+invalid), one representative each
- [ ] Boundaries scoped: probed where the tier decides them, and NOT re-derived where the domain test already owns them
- [ ] Decision table built for member × amount, then trimmed: don't-care columns collapsed, and combinations with no branch behind them in the implementation dropped
- [ ] Preference stated for one test per distinct outcome over one test per combination
- [ ] Negative cases present (quantity 0, amount missing, member flag invalid)
- [ ] Every retained case traceable to the rule (trace IDs)
- [ ] The candidate set is explicitly trimmed before becoming the suite — stopping rule applied, not just generation
- [ ] No rationalization ("coverage is the goal, so I'll keep them all"; "the table has too many columns so I'll write them all")