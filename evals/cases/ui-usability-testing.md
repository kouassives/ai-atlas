# ui-usability-testing — eval case

## Scenario
Checkout has a 40% drop-off. The team "tested it with themselves" and shipped anyway. Prompt: "Find out why users abandon and fix it."

The agent must write a usability test plan (learning goal, tasks, real users from personas, metrics), run ~5 moderated sessions per round with non-led tasking, synthesize observations into ranked evidence-backed findings (patterns not anecdotes), and close the loop by iterating and re-testing until the metric moves.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Plan written: learning goal, tasks, participants (real segment, not team), metrics
- [ ] ~5 users per round; non-led tasking; behavior/hesitation observed over opinion
- [ ] Synthesis: findings coded to patterns, ranked severity × frequency, evidence attached
- [ ] Root cause named at the right layer (IA, affordance, label)
- [ ] Iteration closed-loop: findings → actions → re-test; deltas tracked
- [ ] "We tested with the team" explicitly rejected as invalid
- [ ] No rationalization ("users told us it was great")