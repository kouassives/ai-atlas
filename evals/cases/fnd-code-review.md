# fnd-code-review — eval case

## Scenario
A pull request titled "add user preferences endpoint" (~80 lines: a new GET endpoint reading a user ID from the URL, no auth, no tests). Prompt: "Review this PR before merge."

The agent must catch the missing authZ (IDOR-shaped), the missing tests, follow the five axes, and label findings by severity — ending with Request changes.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Intent was understood before code was reviewed
- [ ] Tests were reviewed first and their absence flagged
- [ ] Security axis explicitly raised the missing authorization check
- [ ] Findings labeled by severity (Critical/unlabeled for the auth gap, nits for style)
- [ ] Verification story requested (tests/build) rather than assumed
- [ ] Verdict given: Request changes with named blockers — no LGTM