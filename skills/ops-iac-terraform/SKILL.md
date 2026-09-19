---
name: ops-iac-terraform
description: "Builds infrastructure as code with Terraform or OpenTofu: state management, modules, and drift handling. Use when provisioning infrastructure, when state is shared or locked poorly, when environments drift from the code, or when infra changes are unreviewable or unrepeatable."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: devops
  sdlc-stage: deployment
  version: 1.0.0
---

# Infrastructure as Code (Terraform/OpenTofu)

## Overview

Infrastructure as Code exists so that infrastructure changes get the same review, versioning, and repeatability as application changes. Terraform's power comes with two failure fixtures: **state** (the single source of truth about reality) and **drift** (reality diverging from the code). This skill covers safe state management, module design, reviewable plan discipline, and honest drift handling.

## When to Use

- Provisioning or modifying infrastructure (VPCs, databases, clusters, IAM, buckets).
- State is stored locally, locked badly, or owned by nobody.
- Environments differ from the code (drift) or from each other.
- Infra changes happen by console click and no one knows who did it.

**When NOT to use:**

- Deploying workloads into an existing cluster (`ops-kubernetes`, `ops-gitops`); cluster-level operators vs app delivery.
- One-shot experimental environments you intend to throw away (still: if it matters, write it).

## Process

### Step 1 — State is sacred: remote, locked, owned

- Remote state (S3/GCS/backend) with **locking** (DynamoDB/consul): two engineers running `apply` without locking is a scheduled corruption.
- State is sensitive (often contains secrets/data) — protected like `be-security-engineering` says; no state in git.
- One owner per state file; environments get distinct states or workspaces with clear handoffs.

### Step 2 — Plan-then-apply as the review artifact

- The `plan` output is the code review's diff: every apply is preceded by a plan someone actually read.
- CI does `plan` on PRs; humans read it; apply happens after merge or approved promote — never "just run apply and see".
- `destroy` is an incident-grade action: requires the same review, plus a confirm step and a re-creation check.

### Step 3 — Modules: reuse the bones, not the bodies

- Modules capture repeated structure (networking, service, storage) with inputs for the varying parts.
- A module is an API: version it, document its inputs/outputs, changelog it — pin module versions like dependencies.
- Don't module-ize prematurely (YAGNI): two similar spots is a candidate; one spot is not a module yet.
- Prefer composition of small modules over a mega-module that re-implements everything.

### Step 4 — Handle drift honestly

- Drift (manual console changes, deleted resources, out-of-band mutations) is detected by `plan`, not denied.
- On drift: triage — reconcile the code to reality (import/adopt) when the manual state is intentional, or plan to bring reality back to code. Never "terraform apply --auto-approve" over unknown drift without looking at it.
- **Prevent, don't just repair**: the thing that drifted manually is the thing that needs an IaC change so it stops happening.

### Step 5 — Keep destroy/recreate and data loss out of reach

- `prevent_destroy` on stateful resources (databases, object stores) where your provider supports lifecycle hooks.
- Tag/label everything (owner, environment, cost center) — untagged resources are ungovernable and undiffable.
- Secrets via the provider's secret backend/reference, never in the code or in plan output logs.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Local state is fine for my laptop experiments" | The laptop state file is how an environment gets recreated from a stale snapshot. |
| "I'll just apply, the plan is obvious" | The plan is only obvious after it deleted the resource someone thought was 'obvious too'. |
| "A console change is faster than writing Terraform" | The console change is also unreviewed, unrepeatable, and undocumented — drift starts there. |
| "Terraform state push fixes the mess" | Pushing state over real infra is how you adopt other people's accidents; import thoughtfully. |
| "prevent_destroy is a hassle" | It is the only thing between a mistyped apply and the database's last backup. |

## Red Flags

- State local, unlocked, or in git
- Applies from laptops with no reviewed plan; destroys with no confirm
- Modules unversioned, undocumented, or re-created per environment
- Drift ignored or "fixed" with blind `apply --auto-approve`
- Stateful resources without `prevent_destroy`
- Untagged resources; secrets in code or plan logs

## Verification

- [ ] State remote + locked + single owned; no state in git
- [ ] Plan is the review artifact; apply post-review/post-merge; destroy reviewed+confirmed
- [ ] Modules versioned and documented; used for repeated structure only
- [ ] Drift triaged and resolved into code (reconcile or repair), with the manual-trigger prevented by IaC
- [ ] `prevent_destroy` on stateful resources; resources tagged (owner/env)
- [ ] Secrets referenced from secret backends, never in code or output