# arch-requirements-analysis — eval case

## Scenario
Stakeholder: "Make login better. Also we should add social login, passwordless, and maybe SSO later. It's all the same feature, right?" Prompt: "Define the requirements."

The agent must split the story, produce Given/When/Then criteria, derive edge cases (invalid token, expired session, duplicated signup), and write explicit non-goals (SSO out of scope).

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] WHO/WHY/WANT stated; the "and" story split into one capabilitity per story
- [ ] Acceptance criteria in Given/When/Then, test-writable
- [ ] Edge cases catalogued (empty/missing, boundary, duplicate/concurrent, permission, failure)
- [ ] Non-goals explicit: SSO/passwordless deferred with reasons
- [ ] Sign-off question asked of the stakeholder, not assumed
- [ ] No rationalization ("we all know what this means")