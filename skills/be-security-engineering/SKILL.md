---
name: be-security-engineering
description: "Implements application security: OWASP Top 10 (2025) guidance for code, authentication and authorization flows, secrets handling, and dependency auditing. Use when handling credentials or untrusted input, when building login or permission systems, when auditing dependencies or fixing vulnerabilities, or when implementing anything that faces untrusted users."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: backend
  sdlc-stage: implementation
  version: 1.1.0
---

# Security Engineering

## Overview

This is the implementation-depth companion to the baseline discipline in `fnd-security-basics`. Where the foundation skill guarantees the minimum for every change, this one covers the deliberate security engineering: the OWASP Top 10 as concrete code decisions, authN/authZ flows done right, secret lifecycle, supply chain risk across dependencies/build/distribution, and error handling that fails closed.

## When to Use

- Building or extending authentication (login, sessions, tokens, MFA) or authorization (roles, permissions, resource checks).
- Handling credentials, keys, PII, or payment data.
- Auditing dependencies, a build pipeline, or artifact provenance — or remediating a vulnerability report.
- Writing or reviewing code where a failure can leave partial state, leak internals, or skip a security check.
- Implementing anything with untrusted input beyond the baseline (uploads, links, templating, SQL, deserialization).

**When NOT to use:**

- Baseline hygiene for ordinary endpoints — run `fnd-security-basics` first and always.
- Threat-modeling workshops or pentest scoping — that is the audit upstream of this skill.
- Cryptographic primitive design — use vetted libraries (libsodium, Tink, JCA/KMS), never bespoke crypto.

## Process

### Step 1 — Map the OWASP Top 10 (2025) classes to code checks

The reference for this skill is the **OWASP Top 10:2025** (8th edition, November 2025). The codes below are that edition, not the 2021 list — if you recall a code that is not here, the mapping has moved.

| Class | The code-level checks |
|---|---|
| **A01 Broken Access Control** | Enforce authZ per resource and method; deny by default; never trust client-supplied role/owner fields |
| **A02 Security Misconfiguration** | Default creds removed; verbose errors off in prod; secure headers (HSTS/CSP/no-sniff); debug endpoints gated |
| **A03 Software Supply Chain Failures** | Deps pinned + lockfile + audit gate; build inputs pinned by digest; pipeline changes reviewed, third-party actions pinned; artifacts signed and verified at deploy (Step 6) |
| **A04 Cryptographic Failures** | TLS everywhere; secrets via KMS/secret manager; sensitive data encrypted at rest with library crypto; no bespoke algorithms |
| **A05 Injection** | Parameterized SQL/ORM for all queries; never string-concatenate queries or shell commands; template escaping context-aware |
| **A06 Insecure Design** | AuthN/Z checked at the boundary (Step 3); make the dangerous path unrepresentable in the framework primitives |
| **A07 Authentication Failures** | Rate-limit login; lockout/backoff; MFA for privileged accounts; session rotation on privilege change |
| **A08 Software or Data Integrity Failures** | Deserialization of untrusted bytes only with allowlisted types; JWT signature+issuer validated, not just decoded; apply updates only after signature verification |
| **A09 Security Logging and Alerting Failures** | Structured logs with request_id, never secrets/tokens/PII; every security-relevant event has an alert condition with an owner and a threshold (Step 7) |
| **A10 Mishandling of Exceptional Conditions** | Handle each error where it happens, global handler as backstop; fail closed + full rollback; generic message out, detail in internal log; alert on the error path (Step 5) |

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

### Step 5 — Exceptional conditions (A10): fail closed, always

This class is the one that produces silently wrong security behaviour, so the rules are non-negotiable:

- **Handle it where it happens.** Catch at the point of failure and do something meaningful — retry with bound, degrade deliberately, or abort. A swallowed exception (`catch {}`, ignored return code, bare `except: pass`) is a finding.
- **Fail closed.** On an unexpected condition the safe default is deny/abort, never admit. No "continue anyway", no `onerror` that silently skips the auth check, no check that returns a permissive value when the lookup failed.
- **Roll back completely.** Multi-step work runs in a transaction or an equivalent compensating action; a half-applied change (row written, permission not, record created, file uploaded) is a security bug even when the operation is not.
- **Generic message out, detail in.** The caller gets a stable generic error plus a correlation id. Stack traces, SQL, internal hostnames, file paths and key material stay in the internal log — never in the response body (CWE-209).
- **Bound the blast radius.** Rate-limit, quota and throttle the paths that fail (retry loops, error-triggered task fan-out); collapse repeated identical failures into one counter instead of one log line each, so a failing dependency cannot flood the log store.
- **One handler per boundary.** Central error middleware/handler per service or process entry point, uniform envelope, always correlated — it is the safety net, never the plan. Missing parameters, null dereferences and insufficient privileges must be handled as outcomes, not crashes.

### Step 6 — Supply chain: dependencies, build, pipeline, distribution (A03)

A03 is not only "the packages you install" — it is everything between a commit and the running artifact.

- **Runtime dependencies**: lockfiles committed; CI failing on high/critical in audit (npm audit, pip-audit, OSV, Grype…); additions reviewed with changelog read, removals celebrated; an unmaintained dependency is a liability worse than a removed feature — schedule the removal, do not let it age.
- **Build**: base images and toolchains pinned by digest, not by tag; no installer fetched over the network at build time (no piping a downloaded script into a shell); build steps isolated and reproducible, with the network restricted to declared dependencies.
- **CI/CD**: the pipeline definition is production code — review changes to it as carefully as application code; third-party actions and components pinned to a version or digest; per-job, least-privilege, short-lived credentials; branch protection on the pipeline files.
- **Distribution**: artifacts signed at build and signature verified on deploy; SBOM attached per build; the deploy target accepts only the signed versions you publish.

### Step 7 — Alerting: someone is on the hook (A09)

Logging is not alerting. An alert condition is a threshold plus a route to a human.

- Wire an alert, not just a log line, for: authentication failures (burst or trend), privilege/role changes, secret or KMS access, bulk data export, injection-shaped input, integrity or signature failures, audit-pipeline silence — and every unhandled exception path from Step 5.
- Carry signal, not payload: counts, rates, source, correlation id. Never key material or personal data in an alert body.
- Make it operable: severity, destination, dedup/suppression window, and a runbook link. An alert nobody has seen fire is an assumption, not a control — fire one in a test and confirm it routes.
- Decide deliberately what does *not* alert (noisy, unactionable), and write that decision down.

### Step 8 — Outbound requests: SSRF (API7:2023)

SSRF is no longer a standalone category in 2025: it was folded into **A01:2025** (CWE-918 sits among that category's mapped CWEs), and it remains **API7:2023 (Server-Side Request Forgery)** in the OWASP API Security Top 10:2023. Neither placement makes the control optional:

- Allowlist by host, port and scheme for every outbound fetch triggered by input — never a user-supplied URL.
- Block cloud-metadata endpoints (link-local `169.254.169.254` and equivalents) and private ranges where the server should not reach out.
- Resolve-then-connect: pin the validated address for the connection, so a second DNS answer cannot swap the host mid-request (rebinding).

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Only admins land here, so the role check is enough" | Role checks without resource checks are the top IDOR in production. |
| "The JWT is signed, it's secure" | Signed JWTs with sloppy validation (no alg pinning, no expiry) are forged within the hour. |
| "It's an internal API, SSRF isn't a concern" | Internal APIs reach internal metadata endpoints — SSRF (API7:2023) is exactly an internal-API risk. |
| "We store the API key in the frontend config, it's obfuscated" | Obfuscation is not security; the secret ships to every browser. |
| "The dependency is old but stable" | "Stable" and "unmaintained" are how CVEs get announced the day you didn't upgrade. |
| "Our pipeline is ours, the supply chain is just the packages" | An unpinned action, a mutable tag, or an unsigned artifact is the same class of risk as an outdated library. |
| "The framework has error handling, so errors are handled" | A global handler is the net, not the plan — without per-site recovery and fail-closed defaults you get skipped checks and half-written state. |
| "We log it, so it's covered" | Logs nobody is paged for are not detection; A09 counts the alert condition, not the log line. |

## Red Flags

- Concatenated SQL or shell strings anywhere near user input
- JWT validation without `alg` pinning, issuer/audience/expiry checks
- AuthZ by role only, missing per-resource ownership checks
- Secrets in query strings, frontend bundles, or committed files
- Unsupported/abandoned dependencies with known-CVE exposure
- Verbose error pages or debug endpoints in production
- Login without rate limiting or lockout
- Empty `catch`, ignored error codes, or a check that returns "allowed" when it could not decide
- Multi-step writes without rollback; error responses carrying stack traces, SQL or internal paths
- Floating tags in the build or pipeline, and deploys that accept unsigned artifacts
- Security-relevant events logged but no alert condition attached

## Verification

- [ ] OWASP Top 10:2025 walked; each of the ten classes applied or explicitly N/A with reason
- [ ] AuthN: vetted password hashing, session/token lifecycle incl. invalidation, login rate limiting
- [ ] AuthZ: authenticated × action × resource checks on every endpoint, deny by default
- [ ] Secrets: injected config only, TLS-only transport, redacted logs, rotate-on-suspicion
- [ ] Exceptional conditions: every error path handled locally and fails closed, rollback complete, generic caller message + correlated internal log, error path wired to an alert
- [ ] Supply chain: dependencies pinned + audited, build inputs digest-pinned, pipeline changes reviewed, artifacts signed and verified at deploy
- [ ] Alerting: each security-relevant event has a threshold, destination and owner; at least one alert tested end-to-end
- [ ] SSRF posture (API7:2023): outbound fetch allowlists; metadata endpoints blocked; DNS rebinding closed
- [ ] No bespoke crypto; vetted libraries used throughout
