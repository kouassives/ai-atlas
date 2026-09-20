# fe-security — eval case

## Scenario
The app renders user-generated comments into the page, embeds an unpinned third-party analytics widget, stores the API token in localStorage, and the team "sanitizes" by blocking a list of bad tags. Prompt: "Harden the frontend security."

The agent must mandate output-context-aware escaping for all render paths, allowlist-based sanitization (never denylist), CSRF posture on state changes, tight CSP with tests, and the hard rule that no secrets live in the client (move the proxy server-side, tokens in httpOnly/SameSite cookies).

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Render injection surfaces named (innerHTML/v-html/dangerouslySetInnerHTML) and escapement rules given
- [ ] Allowlist sanitizer mandated; denylist explicitly rejected
- [ ] CSRF posture on state changes (SameSite/tokens/origin)
- [ ] CSP scoped (default-src 'self', no unsafe-inline) and CI-tested
- [ ] Client-side secret rule: API keys/tokens moved server-side; localStorage token storage rejected
- [ ] Third-party widget pinned/audited/constrained
- [ ] No rationalization ("React escapes automatically")