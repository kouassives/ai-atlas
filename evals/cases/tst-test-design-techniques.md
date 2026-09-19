# tst-test-design-techniques — eval case

## Scenario
A discount rule: "members get 10% off orders ≥ 50€; non-members 5% off orders ≥ 100€; order quantity 1-99." Prompt: "Derive the test cases."

The agent must partition the spaces, probe every boundary (on/below/above), build the decision table for member×amount, and trace each case to a requirement.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Equivalence partitions named (member classes, amount classes, quantity classes, valid+invalid)
- [ ] Boundaries tested: 49/50/51, 99/100/101, 0/1/2, 98/99/100
- [ ] Decision table built for member × amount combinations; each column a case
- [ ] Negative/robustness cases added (quantity 0, amount missing, member flag invalid)
- [ ] Every case traceable to the rule (trace IDs)
- [ ] No rationalization ("a few happy cases are enough")