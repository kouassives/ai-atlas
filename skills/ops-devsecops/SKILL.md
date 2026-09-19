---
name: ops-devsecops
description: "Secures the delivery pipeline: SAST and SCA in CI, secrets scanning, image scanning, and supply-chain defense. Use when building or hardening pipelines, when the repo has no security gates, when dependencies or images ship unchecked, or when supply-chain risks (registry, actions, packages) need bounding."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: devops
  sdlc-stage: build
  version: 1.0.0
---

# DevSecOps

## Overview

Security in delivery is a set of gates that run with every change — not a review that happens at release time. This skill covers the pipeline-layer controls: **SAST** (static analysis of your code), **SCA** (your dependencies), **secrets scanning** (your git history and configs), **image scanning** (your artifacts), and the **supply-chain** discipline (the tools that build your tools). The goal: vulnerabilities fail in CI, where a fix is cheap, not after merge where they are incidents.

## When to Use

- Building or hardening a pipeline with security gates.
- The repo ships with no SAST/SCA/secrets scanning and no one knows the exposure.
- Adding dependencies, base images, or third-party build tools/actions.
- Responding to a scan finding and needing the triage-and-fix loop.

**When NOT to use:**

- Application-layer security in product code (`be-security-engineering`); container image craft itself (`ops-docker-containers`) — this skill gates them, it does not redo them.

## Process

### Step 1 — Fail fast with SAST and SCA in CI

- **SAST** (semgrep, CodeQL, gosec/bandit/spotbugs…) runs on the diff or full tree per push; rules scoped to real risk (injection, authz, secrets, unsafe deserialization).
- **SCA** (OSV, npm audit, pip-audit, Trivy…) checks the locked dependency graph against vulnerability databases.
- Gate policy: **fail on high/critical** (with a triage path for confirmed-not-exploitable in context); warn on medium with noise controls.
- Both feed the same loop: finding → ticket → fix → the fixing PR must be the thing that closes the finding.

### Step 2 — Scan for secrets and kill the leak path

- Secrets scanning (gitleaks, trufflehog) in CI over commits and PRs — AND a **one-time history sweep** of the repo (git-history scan) on adoption: a secret in an old commit is a compromise, not a formatting issue.
- On a hit: treat as compromised (`be-security-engineering` §4) — rotate, do not "uncommit". The repo history has already shipped the credential to every clone.

### Step 3 — Scan images before they become artifacts

- Image scan (Trivy, Grype, docker scan) after build, before push/promotion: OS and app-layer CVEs.
- Gate on critical/high; distinguish "fixable by rebuild" from "needs base image change" (`ops-docker-containers`).
- Image provenance: digest-pinned bases (reproducibility IS security), signed images where the registry supports it.

### Step 4 — Bound the supply chain of your toolchain

- CI actions/workflows: pin to **tagged/digest** versions of trusted publishers; audit third-party actions — a build tool is code you run with your credentials.
- Package registries: trusted, scoped proxies (or at least lockfiles + audits); private packages from a provenance-backed feed.
- Registry/base-image pulls go through a vetted proxy; update cadence for base images and CI tooling is a scheduled task, not a fire drill.

### Step 5 — Make the gates reviewable and owned

- Security gate results are visible in the PR (blocking status checks), not buried in a nightly report.
- Each gate has an owner who can override with a ticket (never a silence); overrides are listed and reviewed.
- Metrics that matter: findings-per-merge, days-to-fix, secrets-leaked-per-quarter. A devsecops program that does not measure itself is a tool install, not a program.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "SAST gives false positives, we skip it" | Unscoped noise is a rule-config problem; skipping the gate deletes the whole signal. |
| "The dependency is used internally, low risk" | Internal exposure + one compromised path is how the migration is questioned later. |
| "That secret is old, we'll rotate next sprint" | Old + exposed = compromised NOW; rotate. |
| "Third-party actions are by a big org, fine" | Big orgs get breached too; pin + audit is the only policy for code you run with CI credentials. |
| "Security checks slow the pipeline" | They run in parallel with the build; the cost is seconds, the alternative is incidents. |

## Red Flags

- No SAST/SCA in CI; findings only in nightly reports nobody reads
- Secrets in git history un-swept; secret removals without rotation
- Images pushed without scanning; unpinned base images
- Third-party actions/registries unpinned and unaudited
- Gate overrides with no ticket, no owner, no review
- No measurement of findings, fix times, or leaks

## Verification

- [ ] SAST + SCA gate CI on high/critical with a triage path; noise scoped
- [ ] Secrets scanning in CI + history sweep done; hits rotated, not uncommitted
- [ ] Image scanning pre-promotion; bases digest-pinned; provenance where supported
- [ ] Actions/tooling pinned+audited; registries scoped; update cadence scheduled
- [ ] Gate results visible in PRs; overrides ticketed and reviewed
- [ ] Program metrics tracked (findings/merge, days-to-fix, leaks)