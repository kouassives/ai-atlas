# tst-performance-testing — eval case

## Scenario
Launch is in 3 weeks. The latency SLA says p95 < 300ms "at scale" but no one can say at WHAT load. Prompt: "Prove it before launch."

The agent must build the load model, run load test against the SLO, find the breaking point with stress, and (where needed) plan a soak.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Load model built from metrics/estimates (mix, concurrency, ramp) — parameters traceable
- [ ] Load test measured p95 against the target, with conditions reported
- [ ] Stress + failure-inject identified the first point of saturation and degradation shape
- [ ] Soak planned where the runtime warrants (leaks/creep)
- [ ] Results reported as evidence (percentiles, conditions), not "felt fine"
- [ ] No rationalization ("use the default tool traffic")