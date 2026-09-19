---
name: ops-ci-cd
description: "Builds and improves CI/CD pipelines: stages, quality gates, artifact flow, and feedback speed. Use when creating or modifying a pipeline, when CI takes too long or misses failures, or when artifacts or deploy promotion between environments feel hand-rolled."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: devops
  sdlc-stage: build
  version: 1.0.0
---

# CI/CD

## Overview

CI/CD is a feedback system: the pipeline's job is to catch problems at the cheapest moment (on push, not in production) and to make delivery boring. Every pipeline decision — stage order, gate placement, artifact shape, caching — is a trade between speed and safety. This skill covers pipeline structure, quality gates, artifact promotion, and the feedback-speed discipline.

## When to Use

- Creating a new pipeline or restructuring a slow one.
- CI misses failures that then surface in staging/production.
- Artifacts are rebuilt per environment or deployed from git checkouts.
- Feedback speed regresses (builds that take an hour are not "CI").

**When NOT to use:**

- Deployment to Kubernetes specifics (`ops-kubernetes`), Terraform provisioning (`ops-iac-terraform`), or pipeline security (`ops-devsecops`).

## Process

### Step 1 — Design the stage order by failure cost

Cheapest failures first: lint/type/unit → build → test tiers that need the build (per `be-tdd` pyramid) → integration → static security checks → package/artifact. Every stage fails as early as it can. A failure found at stage 3 costs more than the same failure at stage 1 — the pipeline should always escalate cost deliberately, never by accident.

### Step 2 — Make gates explicit, not incidental

- **Quality gates** (lint, coverage threshold, security scans, contract tests) are named pipeline steps with pass/fail — not "someone should check the logs".
- Gate placement matches the risk: security scan before merge, contract tests before publish, smoke test before promotion to prod.
- A gate that never fails is noise; a gate that fails on flake is worse — maintain the signal (see `tst-regression` for flake discipline).

### Step 3 — Treat artifacts as the flow's unit, not the repo

- **Build once, promote the artifact**: one build produces the artifact; environments consume copies of the SAME artifact (checksum-verified). Never rebuild from source per environment.
- Version artifacts (semver or commit-derived) so a deployed artifact is identifiable after the fact.
- Promotion moves the artifact (registered + approved), often via GitOps (`ops-gitops`), not "re-deploy from main".

### Step 4 — Optimize feedback speed without cutting safety

- Cache dependencies and build layers (deterministic caches, checksum-keyed — see `ops-docker-containers` for cache discipline).
- Parallelize independent stages; fail-fast on the critical path.
- The rule: **developer wait time is the budget**. If the inner loop (lint→unit→build) exceeds ~10 minutes, the pipeline is in the way, not helping — split or shard it.
- CI changes ARE product changes: merge fast, small, and under the same review rules.

### Step 5 — Fail honestly

- A red pipeline is the team's property, not the author's shame: fix-forward or revert; neither is a trick to make it green.
- Never silently skip/disable a failing gate without a follow-up issue and an owner. Silent green is the most dangerous pipeline state.
- Post-merge: the same pipeline (or its release slice) must be reproducible — the "works on CI" lie starts when environments diverge.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It works locally, CI is just slow" | Local ≠ CI; the pipeline is the only environment the team shares. |
| "We rebuild per environment to be safe" | Rebuilding per environment means each env ran different code. Promote artifacts. |
| "This gate is flaky, let's disable it" | A flaky gate is a test debt (`tst-regression`), not an excuse to delete the guard. |
| "The build takes 40 minutes but it's fine" | 40-minute cycles push developers to batch changes — the compounding cost is invisible. |
| "Skipping the gate this once is fine" | Every "this once" is how the pipeline's guarantees rot. |

## Red Flags

- Stages ordered so expensive failures happen before cheap ones
- Artifacts rebuilt per environment; deployments from source checkouts
- Gates that fail-but-merge, are disabled, or have no owner
- No caching with checksum-keyed invalidation
- Inner loop beyond ~10 minutes with no sharding plan
- CI environment that cannot be reproduced locally

## Verification

- [ ] Stages ordered by failure cost; early-fail discipline in place
- [ ] Quality gates explicit steps with pass/fail; flaky gates tracked as debt
- [ ] Build-once artifact flow; promotion via artifact registry with checksums
- [ ] Caches checksum-keyed; parallel where independent; wait time measured
- [ ] Failing pipeline policy: fix-forward or revert, never silent-skip
- [ ] CI reproducible locally; team waits documented and budgeted