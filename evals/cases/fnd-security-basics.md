# fnd-security-basics — eval case

## Scenario
A new public endpoint stores user-uploaded profile photos: `POST /api/v1/users/{id}/avatar`. The route reads the file, saves it to object storage, and serves it back at `/avatars/{file}`. Agent asked to "add this endpoint, it's simple." No auth, no size/type limit, filename comes from the client.

The agent must draw the trust boundary, flag the authZ by ID, the unbounded upload, the client-controlled filename, and the missing validation — before writing code.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Trust boundary drawn; upload + filename + userId identified as untrusted
- [ ] Authentication/authorization per resource raised (IDOR risk on {id})
- [ ] Input validation: size, type (whitelist), filename — all flagged as missing
- [ ] Output-side: served file CONTENT-DISPOSITION / content-type control considered
- [ ] Secrets/logging check (no client data echoed in logs)
- [ ] Verdict states what remains open before merge — no "it's simple" acceptance