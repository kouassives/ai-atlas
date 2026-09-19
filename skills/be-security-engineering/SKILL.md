---
name: be-security-engineering
description: "Implements application security: OWASP Top 10 guidance for code, authentication and authorization flows, secrets handling, and dependency auditing. Use when handling credentials or untrusted input, when building login or permission systems, when auditing dependencies or fixing vulnerabilities, or when implementing anything that faces untrusted users."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: backend
  sdlc-stage: implementation
  version: 1.0.0
---

# Security Engineering

## Overview

This is the implementation-depth companion to the baseline discipline in `fnd-security-basics`. Where the foundation skill guarantees the minimum for every change, this one covers the deliberate security engineering: the OWASP Top 10 as concrete code decisions, authN/authZ flows done right, secret lifecycle, and dependency risk management.

## When to Use

- Building or extending authentication (login, sessions, tokens, MFA) or authorization (roles, permissions, resource checks).
- Handling credentials, keys, PII, or payment data.
- Auditing dependencies or remediating a vulnerability report.
- Implementing anything with untrusted input beyond the baseline (uploads, links, templating, SQL, deserialization).

**When NOT to use:**

- Baseline hygiene for ordinary endpoints — run `fnd-security-basics` first and always.
- Threat-modeling workshops or pentest scoping — that is the audit upstream of this skill.
- Cryptographic primitive design — use vetted libraries (libsodium, Tink, JCA/KMS), never bespoke crypto.

## Process

### Step 1 — Map the ten classes to code checks

| Class | The code-level checks |
|---|---|
| **A01 Broken Access Control** | Enforce authZ per resource and method; deny by default; never trust client-supplied role/owner fields |
| **A02 Cryptographic Failures** | TLS everywhere; secrets via KMS/secret manager; sensitive data encrypted at rest with library crypto; no bespoke algorithms |
| **A03 Injection** | Parameterized SQL/ORM for all queries; never string-concatenate queries or shell commands; template escaping context-aware |
| **A04 Insecure Design** | AuthN/Z checked at the boundary (Step 3); make the dangerous path unrepresentable in the framework primitives |
| **A05 Misconfiguration** | Default creds removed; verbose errors off in prod; secure headers (HSTS/CSP/no-sniff); debug endpoints gated |
| **A06 Vulnerable Components** | Dependency audit in CI, pinned + lockfiles, upgrade window enforced (Step 5) |
| **A07 Identification Failures** | Rate-limit login; lockout/backoff; MFA for privileged accounts; session rotation on privilege change |
| **A08 Integrity Failures** | Deserialization of untrusted bytes only with allowlisted types; JWT signature+issuer validated, not just decoded |
| **A09 Logging Failures** | Structured logs with request_id; never log secrets/tokens/PII; alert on security-relevant events |
| **A10 SSRF** | Outbound fetch allowlists by host/port/scheme; block cloud-metadata endpoints; no user input in URLs, ever |

### Step 2 — AuthN: who are you, provably

- Passwords: hash with a vetted KDF (bcrypt/argon2/scrypt), per-user salt, constant-time compare; require strength, allow breach-check via haveibeenpwned-style APIs.
- Sessions/tokens: short-lived access + refresh with rotation; tokens stored server-side (or JWTs signed with strong keys + strict validation: signature, issuer, audience, expiry, `alg` pinned — never `none`); session invalidation on logout/password change/privilege change.
- Rate limit and lock out intelligently (per-account + per-IP, with backoff) to keep A07 costs bounded.

### Step 3 — AuthZ: can you do THIS to THIS

Model as three explicit questions per operation:
1. **Authenticated?** (who)
2. **Authorized for the action?** (what: role/permission check — evaluate policy server-side)
3. **Authorized for the resource?** (which: ownership/scope check — this is where object-level bugs live; verify the caller owns or is scoped to the requested `{id}`)

Deny by default; the happy path is the check, not the exception. Every new endpoint gets all three lines, not "it's behind auth".

### Step 4 — Secrets lifecycle

- **At rest**: injected config (env/secret manager) — not code, not repos, not frontend bundles. CI scans for leak patterns and fails on key material.
- **In motion**: sent only over TLS, in headers/bodies — never query strings (logs, history, referrers).
- **In logs**: redacted by default; an error that echoes a token is a security finding.
- **On suspicion**: treat as compromised — rotate everything that shared the secret, do not "clean up formatting".

### Step 5 — Dependencies as attack surface

- Lockfiles committed; CI failing on high/critical in audit (npm audit, pip-audit, OSV, Grype…).
- Additions reviewed with changelog read; removals celebrated.
- An unmaintained dependency is a liability worse than a removed feature — schedule the removal, do not let it age.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Only admins land here, so the role check is enough" | Role checks without resource checks are the top IDOR in production. |
| "The JWT is signed, it's secure" | Signed JWTs with sloppy validation (no alg pinning, no expiry) are forged within the hour. |
| "It's an internal API, SSRF isn't a concern" | Internal APIs reach internal metadata endpoints — SSRF is exactly an internal-API risk. |
| "We store the API key in the frontend config, it's obfuscated" | Obfuscation is not security; the secret ships to every browser. |
| "The dependency is old but stable" | "Stable" and "unmaintained" are how CVEs get announced the day you didn't upgrade. |

## Red Flags

- Concatenated SQL or shell strings anywhere near user input
- JWT validation without `alg` pinning, issuer/audience/expiry checks
- AuthZ by role only, missing per-resource ownership checks
- Secrets in query strings, frontend bundles, or committed files
- Unsupported/abandoned dependencies with known-CVE exposure
- Verbose error pages or debug endpoints in production
- Login without rate limiting or lockout

## Verification

- [ ] Ten OWASP classes walked and each applicable check applied or explicitly N/A with reason
- [ ] AuthN: vetted password hashing, session/token lifecycle incl. invalidation, login rate limiting
- [ ] AuthZ: authenticated × action × resource checks on every endpoint, deny by default
- [ ] Secrets: injected config only, TLS-only transport, redacted logs, rotate-on-suspicion
- [ ] Dependencies pinned + lockfile, CI audit gate, changelog-reviewed additions
- [ ] SSRF posture: outbound fetch allowlists; metadata endpoints blocked
- [ ] No bespoke crypto; vetted libraries used throughout