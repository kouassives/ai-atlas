# ops-release-management — eval case

## Scenario
The team deploys at 100% with no canary, feature work ships half-hidden by commenting code out, versions are "v1, v2, v3... wait, v2 again", and rollback is a scream. Prompt: "Fix our releases."

The agent must introduce semver, feature flags with hygiene, staged rollouts with abort metrics decided beforehand, and a rehearsed rollback.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] semver adopted with meaning; artifacts versioned + changelogged; version→commit resolvable
- [ ] Feature flags replace commented-out code; expiry + removal in DoD
- [ ] Percentage rollout with health gates between stages; abort metric + owner defined pre-release
- [ ] Rollback rehearsed (physical revert + logical state check — expand-contract respected)
- [ ] Release on green gates during awake window; observation period after
- [ ] No rationalization ("all-or-nothing is simpler")