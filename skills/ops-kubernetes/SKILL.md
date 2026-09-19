---
name: ops-kubernetes
description: "Deploys and operates workloads on Kubernetes: manifests, health probes, resource requests and limits, networking, rolling updates, and rollbacks. Use when writing or reviewing cluster manifests, when pods restart mysteriously or get scheduled badly, when a deployment has no rollback story, or when resource usage is unconstrained."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: devops
  sdlc-stage: deployment
  version: 1.0.0
---

# Kubernetes

## Overview

Kubernetes turns YAML into a distributed system — which means the YAML is where the mistakes happen. This skill covers the deployment basics that keep workloads healthy and recoverable: explicit resources, real health probes, sane networking, and a rollout/rollback story. Its whole job is to make the cluster predictable when it will least predictably fail.

## When to Use

- Writing or reviewing Deployments, Services, Ingresses, ConfigMaps, or jobs.
- Pods restart-loop, get scheduled onto the wrong nodes, or die at scale.
- A rollout goes wrong and there is no rollback procedure.
- Tuning resource allocation or autoscaling.

**When NOT to use:**

- Building the image itself (`ops-docker-containers`), provisioning clusters/state (`ops-iac-terraform`), or GitOps delivery (`ops-gitops`).

## Process

### Step 1 — Declare resources explicitly

- `requests` = what the scheduler reserves; `limits` = what the runtime kills at. Set BOTH on every container: requests for scheduling honesty, limits for runaway protection.
- Set them from observed usage (profile, don't guess — `be-performance`), with headroom for bursts.
- HPA scales on metrics; it cannot fix an under-requested container that the scheduler oversubscribed.

### Step 2 — Health checks: liveness vs readiness are different lies

- **readiness** gates the Service traffic: the pod is not receiving load until ready. Point it at the real dependency state (DB warm, cache connected).
- **liveness** restarts the container on deadlock/hang. If you only have one probe, readiness-first; a wrong liveness probe restarts healthy pods in a loop (restart storms are the classic symptom).
- `startupProbe` for slow-starting apps prevents liveness from killing them before ready.
- The probe must test the app itself, not a shell in the same image (follows `ops-docker-containers` §5).

### Step 3 — Replicas and rollout: always have a rollback story

- `strategy: RollingUpdate` with `maxUnavailable`/`maxSurge` tuned for the workload's semantics (e.g. 0 for stateful-critical paths).
- **PodDisruptionBudget** for voluntary disruptions (node drains, autoscaling): without it, upgrades can drain the whole service.
- Rollbacks: every release is a *previous ready manifest* record — `kubectl rollout undo` is the emergency brake, but the planned picture (GitOps `ops-gitops`, tagged manifests) is the routine one.
- Versioned images + `rollout status --timeout` in the pipeline so bad rollouts are seen before the alert arrives.

### Step 4 — Networking: keep it explicit and least-privilege

- Services and Ingresses: least-access rules, TLS termination pinned (no default certs), no Service of type LoadBalancer where an Ingress/ClusterIP serves.
- NetworkPolicy where the cluster supports it — namespaces are not security boundaries by themselves.
- Config and secrets via ConfigMap/Secret injected as volumes/env — never baked in the image (`ops-docker-containers`).

### Step 5 — Operate like incidents are planned

- Logs/metrics from the cluster follow `ops-observability`; pod restarts, node pressure, and image pulls are alertable signals, not research projects.
- Taint/toleration and affinity keep workloads where they belong; don't scatter scheduling hopes across labels.
- Version/drift: the running cluster state and the repo state must match (GitOps closes this loop).

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "No limits — pods can burst" | Unbounded limits are how one neighbor starves the node and the scheduler taints everything. |
| "One probe is enough" | Readiness and liveness ask different questions; collapsing them produces either restarted-but-serving or dying-but-serving pods. |
| "We'll write the rollback if we need it" | Incidents are not the time to reconstruct the previous good state. |
| "Default replicas=1 is fine for now" | Single-replica without PDB is an availability NFR violation in disguise. |
| "The image has the config baked in" | Config in image = one build per environment and secrets in layers. |

## Red Flags

- Missing requests/limits, or limits set from vibes not profiles
- Wrong probe shape: liveness that kills slow starts, readiness that ignores real dependencies
- No PDB, no rollback record, no `rollout status` wait in pipeline
- Services/Ingresses more permissive than needed; default TLS certs
- Config/secrets baked into images
- Scheduling hopes (labels/affinities) with no plan

## Verification

- [ ] requests+limits on every container, set from measured usage with burst headroom
- [ ] readiness (real dependency state) and liveness (hang detection) correct; startupProbe where slow-starting
- [ ] RollingUpdate tuned; PDB present for critical workloads; rollback manifest is recorded and replayable
- [ ] Pipeline waits on rollout status with timeout; bad rollouts caught pre-alert
- [ ] Networking least-privilege; TLS pinned; NetworkPolicy used where supported
- [ ] Config/secrets injected, never baked; cluster state matches repo/GitOps