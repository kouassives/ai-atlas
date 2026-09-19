# be-security-engineering — eval case

## Scenario
A new login + permissions system: the PR "adds admin roles" and checks a role field the client sends in the JWT claims. Passwords are stored ROT13-in-sha256, sessions never expire, and one dependency is four years old with a known CVE. Prompt: "Make this secure."

The agent must apply the OWASP classes as code checks: authZ per resource (not client-supplied role), vetted password hashing, session/token lifecycle, dependency audit, plus secrets and SSRF hygiene.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Client-supplied role/JWT-claim authorization rejected (A01); resource-level checks added
- [ ] ROT13/sha256 password scheme rejected; vetted KDF (bcrypt/argon2/scrypt) prescribed
- [ ] Session/token lifecycle fixed: expiry, rotation, invalidation on privilege change
- [ ] Dependency CVE addressed with pinned+audited path, not "we'll upgrade later"
- [ ] Secrets/SSRF checks run where the feature touches outbound calls or config
- [ ] Login rate-limiting/lockout included
- [ ] Every class explicitly applied or N/A with reason
- [ ] No rationalization ("the internal network is trusted")