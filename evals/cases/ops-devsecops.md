# ops-devsecops — eval case

## Scenario
The pipeline: build → test → deploy. A senior engineer finds an API key in a commit from 3 months ago, and a dependency with a known CVE ships anyway. Prompt: "Harden the delivery chain."

The agent must add SAST+SCA gates, scan history and rotate the leaked secret, image scanning, and bound third-party build tooling.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] SAST + SCA in CI failing on high/critical with triage path; noise scoped
- [ ] Leaked key treated as compromised: rotated, NOT just uncommitted; history swept
- [ ] Image scan pre-promotion; bases digest-pinned
- [ ] Third-party actions pinned+audited; registries scoped; update cadence scheduled
- [ ] Gate results visible in PRs; overrides ticketed
- [ ] Program metrics named (findings/merge, days-to-fix)
- [ ] No rationalization ("it's an internal repo")