# ops-ci-cd — eval case

## Scenario
A 40-minute pipeline: lint → build → all tests → deploy on every commit, artifacts rebuilt per environment, and a flaky coverage gate that "everyone ignores". Prompt: "Fix the pipeline."

The agent must reorder by failure cost, gate explicitly, build-once/promote artifacts, cache for feedback speed, and own the flaky gate — not delete it.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Stages reordered cheapest-first; failure cost escalation deliberate
- [ ] Quality gates explicit pass/fail; flaky gate assigned debt, not deleted
- [ ] Build-once artifact flow; environments consume the same artifact (checksums)
- [ ] Caches checksum-keyed; independent stages parallelized
- [ ] Developer wait time budgeted; inner loop target stated
- [ ] Red pipeline policy: fix-forward or revert — no silent skip
- [ ] No rationalization ("it's been like this forever")