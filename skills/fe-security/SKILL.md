---
name: fe-security
description: "Secures the client side: XSS, CSRF, sanitization, secure headers, and client-side secret hygiene. Use when rendering user content, embedding third-party code, handling tokens in the browser, or when the frontend is part of the ingested untrusted-data path."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: frontend
  sdlc-stage: implementation
  version: 1.0.0
---

# Frontend Security

## Overview

The browser is an extension of the attacker's test lab: everything rendered is an injection surface, every embedded third party is code you do not control, and every secret in the client is published. This skill covers the client-side front: XSS prevention at every render, CSRF defense for state changes, sanitization that is an allowlist, secure headers, and the rule that the frontend holds no secrets.

## When to Use

- Rendering user-generated content (comments, profiles, rich text, files).
- Embedding third-party scripts/widgets, or building browser extensions.
- Handling tokens/cookies in the client, or any state-changing request.
- Reviewing frontend code as part of the security baseline (`fnd-security-basics` applies always; this is its client-side depth).

**When NOT to use:**

- Server-side credential/authz handling (that is `be-security-engineering`); this skill covers what the browser can and cannot be trusted with.

## Process

### Step 1 — Treat every render as an injection

- Framework-escaped rendering is the default; the danger is every escape hatch: `dangerouslySetInnerHTML`, `v-html`, `innerHTML`, template injection, `eval` anywhere.
- Escaping must be output-context-aware (HTML, attribute, URL, JS). One regex will not serve all contexts — use the framework's context-aware escaping.
- **Never** put user input into URLs you fetch, style/link hrefs, or script/src — think `javascript:` in an `href`.

### Step 2 — Sanitize with an allowlist, at the boundary

- Rich content: sanitize with a vetted allowlist library (DOMPurify-class) that strips tags/attributes by permit, not denylist patterns. A denylist of "bad tags" is the XSS that ships next Tuesday.
- Sanitize the content at ingestion (or render-side with the same allowlist), then treat it as data — tagged and escaped at render.
- Link-allowlisting (http/https only) covers `javascript:`/`data:` schemes in user-authored links.

### Step 3 — Defend state-changing requests (CSRF)

- State-changing requests: same-site cookies (`SameSite`), CSRF tokens where the auth model requires them, and explicit origin/referer checking where applicable — never "we trust our own frontend".
- Protected endpoints reject cross-site submissions; `Content-Type` enforcement stops simple-form CSRF.
- Sensitive operations confirm intent (re-auth for destructive acts) — the frontend enforces the UX; the server enforces the truth (`be-security-engineering` §3).

### Step 4 — Serve the security headers from the app

- CSP (Content Security Policy) scoped tightly: default-src 'self', no `unsafe-inline`/`unsafe-eval` unless a real feature requires it (and then hash/nonce it); frame-ancestors to kill clickjacking; X-Content-Type-Options: nosniff; Referrer-Policy.
- CSP is enforced in the served response AND tested in CI — a CSP header that never got reviewed is a decoration.
- The frontend's role: don't trigger CSP violations with inline scripts/styles; keep third-party embeds explicit and allowlisted.

### Step 5 — The client keeps no secrets

- Anything in the bundle is public: API keys, tokens, secrets in config — the frontend ships all of it (`fnd-security-basics`).
- Tokens live in secure, httpOnly, SameSite cookies (or as short-lived in-memory where the flow demands) — not localStorage-forever (XSS reads localStorage).
- Third-party scripts are dependencies: pinned, audited, minimized — a compromised embed is a running keylogger (`ops-devsecops` supply-chain thinking applies to `<script src>`).

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "React/Vue escapes automatically" | Only through the safe paths; every dangerHTML/v-html bypass is yours. |
| "The sanitizer blocks bad tags — good enough" | Denylist sanitizers are how the next mutation XSS ships. |
| "We need the API key in the bundle for the SDK" | Then the API key is public by definition; put it server-side and proxy. |
| "Our site doesn't store anything sensitive, CSRF is moot" | CSRF is about actions, not data — an email-change is damage enough. |
| "Third-party widget is from a big company" | Big companies get injected too; pin, audit, and constrain the embed. |

## Red Flags

- `dangerouslySetInnerHTML`/`v-html`/`innerHTML` on user content without allowlist sanitize
- User input in URLs, style/link/script sources; `javascript:` reachable
- Denylist sanitizers; no CSP or a CSP with unsafe-inline/unsafe-eval everywhere
- Tokens/secrets in localStorage or the bundle; API keys client-side
- Unpinned third-party scripts/widgets
- State changes without CSRF posture (SameSite/tokens/origin checks)

## Verification

- [ ] All escape hatches audited; user content rendered escaped and/or allowlist-sanitized
- [ ] URLs/link sources restricted to safe schemes; no input-borne `javascript:`
- [ ] CSRF posture on state changes (SameSite + tokens/origin where needed); re-auth for destructive acts
- [ ] CSP tight, nonce/hash for exceptions, served and CI-tested; nosniff + referrer policy
- [ ] No secrets in the client; tokens in httpOnly/SameSite cookies or short-lived memory
- [ ] Third-party embeds pinned, audited, minimized