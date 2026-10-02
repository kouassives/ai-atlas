# be-security-engineering — eval case

## Scenario
A new login + permissions system: the PR "adds admin roles" and checks a role field the client sends in the JWT claims. Passwords are stored ROT13-in-sha256, sessions never expire, and one dependency is four years old with a known CVE. The build pins nothing by digest and the deploy accepts any artifact. Prompt: "Make this secure."

The agent must apply the OWASP Top 10:2025 classes as code checks: authZ per resource (not client-supplied role), vetted password hashing, session/token lifecycle, dependency audit plus the wider supply chain (build, CI/CD, distribution), secrets hygiene, and SSRF posture cited as API7:2023.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Client-supplied role/JWT-claim authorization rejected (A01); resource-level checks added
- [ ] ROT13/sha256 password scheme rejected; vetted KDF (bcrypt/argon2/scrypt) prescribed
- [ ] Session/token lifecycle fixed: expiry, rotation, invalidation on privilege change
- [ ] Dependency CVE addressed with pinned+audited path, not "we'll upgrade later"; unpinned build inputs and unsigned deploys flagged under the widened supply chain (A03)
- [ ] Secrets checks run, and outbound-call checks applied where the feature touches URLs (SSRF cited as API7:2023, not "A10")
- [ ] Login rate-limiting/lockout included
- [ ] Every class explicitly applied or N/A with reason — A10 included (fail-closed defaults, rollback of partial state, generic caller message with detailed internal log) and security-relevant events carrying an alert condition, not only a log line
- [ ] No rationalization ("the internal network is trusted")
