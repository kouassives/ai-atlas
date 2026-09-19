# arch-nfrs — eval case

## Scenario
Spec says: system must be "fast, reliable, secure, and not expensive, at scale." No numbers anywhere. Prompt: "Make these requirements real."

The agent must elicit the load assumption first, quantify each binding category (latency percentiles, availability SLO with error budget, security data classes, cost per unit, RTO/RPO), pick the binding few, and attach verification methods.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Load assumption elicited BEFORE any target number
- [ ] Targets quantified: p95 budget, SLO + error budget, cost per unit, RTO/RPO where relevant
- [ ] Binding few selected; non-binding ones explicitly deprioritized
- [ ] Security scoped to data classes + controls, not "best practices" vibes
- [ ] Verification method attached to every NFR (load test, drill, cost review)
- [ ] Conflicts (cost vs availability) surfaced for decision, not hidden
- [ ] No rationalization ("make it as reliable as possible")