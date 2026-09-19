---
name: fnd-security-basics
description: "Applies the baseline security discipline every feature needs: drawing the trust boundary, validating all untrusted input, authenticating and authorizing every access, protecting secrets, and checking dependencies. Use when a feature takes untrusted input, when handling credentials or personal data, when asked 'is this secure', when hardening an endpoint or service, or before touching anything that faces the internet."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: foundation
  sdlc-stage: implementation
  version: 1.0.0
---

# Security Basics

## Overview

Security is not a feature; it is a discipline applied at every boundary. This skill is the baseline that every change must meet before it is called done. It covers the minimum: trust boundaries, input validation, authentication and authorization, secrets handling, and dependency hygiene. Deep analysis (threat modeling, cryptography design, pentesting) is downstream of this skill.

## When to Use

- The code touches ANY input you do not fully control (forms, URLs, files, APIs, config, third-party payloads).
- Credentials, tokens, or personal data are involved.
- Someone asks "is this secure?" — run this checklist before answering.
- A new endpoint, service, or integration is added.
- Before merging anything that faces the internet or a network boundary.

**When NOT to use:**

- Designing cryptographic algorithms — use established, vetted libraries instead of this skill.
- A full threat model or pentest engagement — this is the baseline, not the audit.
- Pure frontend styling or documentation-only changes with no data flow.

## Process

### Step 1 — Draw the trust boundary

Draw a diagram (even a mental one) of where untrusted data enters the system. Everything crossing that boundary is **untrusted** until validated — including data from your own services if they can be influenced by users, logs, or config.

### Step 2 — Validate input at the boundary, never at usage

- Reject, don't sanitize: whitelists over blacklists; explicit types and ranges; max lengths and payload sizes.
- Validate shape/semantics immediately after parsing — before it reaches business logic.
- Every external data source (API responses, files, env, user content) is treated as attacker-controlled.

### Step 3 — AuthN and AuthZ on every entry point

- Authenticate first: who is calling? Missing authentication is a finding, not a "later".
- Authorize per operation: does this caller have the right for THIS resource? IDOR (object-level authorization) is the most common missed check.
- Never trust values from the client for identity or authorization decisions.
- Use the framework's established auth primitives — do not hand-roll tokens, hashing, or sessions.

### Step 4 — Protect secrets

- No secrets in code, logs, frontends, or version control. Ever. Detection in CI is mandatory.
- Secrets in injected configuration (env/secret managers), not in code or committed files.
- Logs and error messages must not echo tokens, passwords, or PII.
- Treat leaked secrets as compromised: rotate, do not "fix the formatting".

### Step 5 — Dependency hygiene

- Pin dependencies; audit them (`npm audit`, `pip-audit`, OSV, etc.) before and after adding.
- One dependency per reviewable change; read the changelog, not just the version number.
- Every dependency is a liability: prefer the standard library and existing primitives.

### Step 6 — Apply the output-side checks

- Encode output for its context (HTML → escape for XSS; SQL → parameterize; shell → never interpolate).
- Headers: sensible default (HSTS, CSP, no-sniff) unless something explicitly requires otherwise.
- Rate-limit and bound anything exposed to the internet.

### Step 7 — Record the verdict

State explicitly what was checked and what remains open (e.g. "auth delegated to the gateway — verify gateway policy"). An unstated assumption is how breaches happen.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It's an internal service, no one will attack it" | Internal services are reached through the same compromised user sessions — authZ applies everywhere. |
| "We sanitize on output, that's enough" | Validation at the boundary is where the type and semantics are known. Output encoding is a second layer, not a replacement. |
| "The token is only in a query param" | Logs, history, and referrers leak query strings. Credentials belong in headers or bodies, not URLs. |
| "We'll add auth later, it's a spike" | Auth bolted on later is re-architected, not added. |
| "This secret is only for dev" | Dev secrets leak to prod configs and repos with alarming regularity. Treat all committed secrets as compromised. |

## Red Flags

- Client-authored identity or authorization values trusted server-side
- Validation happening at usage sites instead of at the boundary
- Secrets in config committed to repositories, or tokens in URLs/logs
- Missing authZ on a resource fetch by ID (IDOR-shaped code)
- Dependency bumps with no audit and no changelog review
- Error responses leaking internals, stack traces, or credentials

## Verification

- [ ] Trust boundary drawn; all crossings identified
- [ ] Input validated (type, length, range) at the boundary for every untrusted source
- [ ] Every entry point authenticated and authorization checked per resource
- [ ] No secrets in code/logs/URLs/committed files; secret handling uses injected config
- [ ] Dependencies pinned, audited, changelog reviewed
- [ ] Output-encoding and header baseline applied
- [ ] A verdict statement lists what was checked and what remains open