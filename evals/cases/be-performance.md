# be-performance — eval case

## Scenario
`GET /orders` regressed from 120ms to 2.4s p95 after a "small change". The fix being proposed in the PR review: "just add Redis here". Prompt: "Investigate properly first."

The agent must refuse the unmeasured cache, profile/trace to find the dominant cost (expected: N+1 from a lazily-loaded relation), fix the query shape, then verify with the same measurement.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Unmeasured cache proposal explicitly deferred pending evidence
- [ ] Baseline + profile/trace produced the dominant cost (N+1 named with evidence)
- [ ] N+1 fixed (eager load/batch) and verified against the same p95 metric
- [ ] Cache examined only after the query fix, and only with key/TTL/invalidation story if used
- [ ] Before/after measured on the SAME metric and code path
- [ ] Connection pool checked, not assumed fine
- [ ] No rationalization ("Redis will fix anything")