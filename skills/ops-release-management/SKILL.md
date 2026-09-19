---
name: ops-release-management
description: "Releases software safely: semantic versioning, feature flags, staged rollouts, and rollback procedures. Use when cutting a release, when a deploy needs to reach users gradually, when features ship half-finished and hide, or when rollback means panic and prayer."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: devops
  sdlc-stage: deployment
  version: 1.0.0
---

# Release Management

## Overview

A release is the moment all other engineering discipline is cashed in. This skill covers the mechanics that make releases boring: **semantic versioning** so versions mean something, **feature flags** so code ships before behavior is exposed, **staged rollouts** so damage is bounded, and **rollback procedures** so "undo" is a rehearsed motion, not a fire drill.

## When to Use

- Cutting a release or defining the release process for a product.
- Deploying a risky change to production.
- Shipping features in progress without exposing them (or hiding a broken one).
- The team has no rehearsed rollback and no rollout stages.

**When NOT to use:**

- Versioning library/API contracts (that is `arch-api-contract-design`); deployment mechanics (that is `ops-kubernetes`/`ops-gitops`); pipeline shape (`ops-ci-cd`).

## Process

### Step 1 — Semantic versioning with honest meaning

- **MAJOR** breaking changes, **MINOR** backward-compatible features, **PATCH** backward-compatible fixes.
- Version communicates compatibility to consumers; version EVERY consumable artifact and changelog it (`fnd-technical-writing` §5).
- Tag releases in git; the artifact's version is resolvable back to the exact commit (`ops-gitops` §3).

### Step 2 — Use feature flags for safe exposure

- **Flags decouple deploy from release**: code ships dark, behavior is turned on per audience.
- Flag hygiene: short-lived by default (with expiry), evaluated server-side for real toggles, flag removal is part of the feature's DoD (an expired flag is dead config).
- Never use flags as a versioning mechanism (flags are for behavior, versions are for compatibility).
- Progressive exposure with flags = gradual rollout (Step 3) with an instant kill-switch.

### Step 3 — Stage the rollout, bound the blast radius

- **Canary/percentage rollout**: 1% → 10% → 50% → 100%, gated by health signals between steps (error rate, latency percentiles — `ops-observability` RED).
- Staged by populations that matter: internal first, then tenants/regions least-risky-first.
- Every stage has an abort condition decided BEFORE the release (not "we'll see how it feels"): the metric that says "stop and rollback" and the owner who calls it.

### Step 4 — Rehearse rollback as a feature

- Rollback is a normal operation with a procedure (`ops-gitops` §3 makes it a git revert): the procedure is exercised in staging, and the rollback path for the artifact is versioned too.
- **Rollback physical vs logical**: image/version revert is fast but state may have moved; verify data-backward-compatibility (schema/migrations with the expand-contract discipline of `be-database-design`) so a revert is actually safe.
- The rollback decision rule: the same abort metric that stops a rollout triggers the rollback. Deciding at incident time is deciding at the worst time.

### Step 5 — Coordinate the release itself

- Releases happen when the pipeline gates are green AND people are awake to watch (post-deploy observation window, not "deploy at midnight hoping").
- The release note to stakeholders = changelog delta + the observability anchor ("the p95 and error-rate panels are the truth for this deploy").
- Post-release: the abort metric stays watched for the observation window; the release is only "done" after the window, not after the deploy.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We don't version, it's internal" | Internal consumers version-depend too, and the log line 'version unknown' is the worst one. |
| "Feature flags are dead config, skip them" | Flags exist to bound exposure; the hygiene problem is removal, not existence. |
| "All-or-nothing deploy is simpler" | All-or-nothing is how a 2% data issue becomes a 100% incident. |
| "Rollbacks are easy, we just redeploy old" | Only if state is backward-compatible; otherwise the 'easy' rollback corrupts data. |
| "We can decide the abort metric during the incident" | During the incident you decide under fire; define it before, when you can think. |

## Red Flags

- Versions that don't follow semver or can't be traced to commits
- Features shipped hard-exposed with no flag; flags with no removal plan
- Deploys at 100% with no canary and no abort condition
- No rehearsed rollback; rollback that would corrupt data (state moved on)
- Releases cut on hopes ("should be fine") instead of green gates
- Observation window ended at the deploy button

## Verification

- [ ] semver used meaningfully; consumable artifacts versioned + changelogged; version→commit resolvable
- [ ] Exposure via short-lived flags with expiry and removal in DoD
- [ ] Percentage/canary stages with health gates; populations ordered by risk
- [ ] Abort metric + owner decided before release; rollback rehearsed and safe for state
- [ ] Release on green gates during an awake window; post-deploy observation period enforced
- [ ] Release declared done after the window, with metrics as the truth