# ops-monitoring-alerting — eval case

## Scenario
The pager fires on every 5xx for 5 minutes. There is no SLO. Two alerts have runbooks; the rest say "errors high". On-call ignores pages. Prompt: "Restore trust in the pager."

The agent must establish an SLO + error budget, burn-rate alerting, actionable alerts (what/how bad/what to do), and triage the noise.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] SLO defined with error budget, tied to user-visible journey
- [ ] Burn-rate alerting replaces blip rules (page vs ticket levels)
- [ ] Every remaining page answers what/badness/action; runbooks written at creation
- [ ] Noise triaged; suppressions owned + expiring; post-incident page review feeds rules
- [ ] Escalation explicit (primary→secondary→manager); routing by ownership
- [ ] No rationalization ("every 5xx must page, safety first")