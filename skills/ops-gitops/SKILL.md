---
name: ops-gitops
description: "Runs deployments declaratively with GitOps: Git as the single source of truth, ArgoCD/Flux style reconciliation, and environment promotion. Use when deployments are imperative scripts, when cluster state drifts from any repo, or when promoting between environments is manual and error-prone."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: devops
  sdlc-stage: deployment
  version: 1.0.0
---

# GitOps

## Overview

GitOps makes Git the single source of truth for what runs where: the desired state lives in a repo, an operator (ArgoCD, Flux) reconciles the cluster to it, and every change is a merge with a diff and a rollback story. The value is not the tool — it is that **drift is visible and changes are reviewable** by the same machinery as code.

## When to Use

- Deployments happen via imperative scripts, kubectl one-liners, or cron deploys.
- Cluster state and repo state diverge and nobody can say when or why.
- Promoting between dev/staging/prod is manual and error-prone.
- A deployment breaks and the rollback path is "we remember the old yaml".

**When NOT to use:**

- Single small cluster, single author, no environment matrix — `kubectl apply` with a well-organized repo may honestly be enough (KISS).
- Provisioning the cluster's infra itself (that is `ops-iac-terraform`).

## Process

### Step 1 — Put the desired state in Git, exclusively

- The deployment repo holds the full desired environment: manifests, config, secrets references (external, via the cluster's secret manager), image versions.
- The rule: **nobody changes a running cluster except the operator reading Git**. Manual `kubectl edit` is drift by definition, even if "temporary".
- One repo/branch per environment with an explicit promotion path (see Step 4).

### Step 2 — Reconcile, and surface drift as a finding

- The operator polls or watches Git and converges the cluster to the repo state (auto-sync with `selfHeal`, or manual sync — decide per environment; prod commonly manual-sync with a visible diff).
- Drift (out-of-band changes) surfaces as a diff in the operator UI/status: treat it as an incident-report, not a log line. Find out WHAT changed the cluster ownerlessly and fix the process (`ops-iac-terraform` §4 discipline applies).
- Never auto-sync over unknown drift — look at it before reconciling it away (that is how manual hotfixes get silently destroyed).

### Step 3 — Make rollbacks a normal operation

- Rollback = merge/revert the Git state; the operator does the rest. The rollback story is a previous commit — trivial and perfect.
- Keep image versions explicit and immutable-registry-resolvable so "that exact state" stays reproducible.

### Step 4 — Promotions are PRs with diff review

- dev → staging → prod promotions move the SAME artifact (`ops-ci-cd` §3) and the SAME manifests, through merge requests that show the plain diff.
- Add the release gate at promotion: smoke tests (see `tst-e2e-testing` for journey tests), config diff, and approval where compliance demands it.
- The promotion asks only for the actual delta; "staging drifted" is a repo problem, not a promotion blocker by itself — fix the drift first, then promote.

### Step 5 — Keep the loop honest

- The operator's health, sync status, and last-sync time are monitored (`ops-monitoring-alerting`): a GitOps operator that silently stops reconciling is a time bomb.
- Pipeline (CI) builds and pushes the artifact; GitOps (CD) only promotes desired state — don't blur them into one "+ync" script that deploys from build machines with credentials.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We hotfixed prod directly, it's faster" | That's exactly when the operator self-heals it away or everyone else's state is now wrong. |
| "Auto-sync everything; Git is truth" | Auto-sync over unknown drift quietly deletes manual (maybe intentional, maybe not) changes. |
| "Rollback is just git revert" | Yes — that is the whole point, and why this system is cheaper than every imperative one. |
| "We'll adopt GitOps later" | Later means after the next incident where prod and repo diverge. |
| "kubectl apply is basically GitOps" | apply preserves the imperative habit; Git-as-truth plus reconciliation is the difference. |

## Red Flags

- Manual cluster changes not represented in Git
- Auto-sync self-healing over unresolvable drift without a visible diff
- Promotions by copy-paste commands instead of PRs
- Rollback story = "we remember what it looked like"
- Operator not monitored (sync health/last-sync absent from dashboards)
- CI machines holding CD credentials and deploying directly

## Verification

- [ ] Git holds the full desired state; manual cluster edits are an incident, not a shortcut
- [ ] Reconcile discipline chosen per environment; drift surfaces as visible conflict
- [ ] Rollback = previous commit, reproducible; images immutable+resolvable
- [ ] Promotions are PRs with artifact+manifest diff, smoke gate, and approval where needed
- [ ] Operator health/sync monitored; last-sync visible
- [ ] CI builds/pushes, GitOps promotes — credentials separation enforced