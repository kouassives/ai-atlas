---
name: arch-nfrs
description: "Defines measurable non-functional requirements: performance, availability, security, cost, and compliance — quantified so a system can be designed and verified against them. Use when a system or feature needs concrete NFRs, when requirements say 'fast', 'reliable', or 'secure' with no numbers, or when design decisions must be judged against explicit quality targets."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: architect
  sdlc-stage: design
  version: 1.0.0
---

# Non-Functional Requirements

## Overview

"Fast", "reliable", "secure", "cheap" are feelings, not requirements. An NFR catalog turns each into a **quantified, measurable, acceptable-cost** statement a design can target and verification can check. This skill is the catalogue of NFR categories with quantification techniques, the art of picking which ones actually bind, and the discipline of recording them with owners and verification methods.

## When to Use

- A requirement says "fast/reliable/secure/scalable" with no number attached.
- Designing a system or feature that must be judged against explicit quality targets (feed `arch-system-design`).
- Choosing between designs and needing an objective basis for the decision.
- Defining SLOs / budgets that operations will later carry (`fnd-adr` for the commitments).

**When NOT to use:**

- Diagnosing a live performance/security issue — that is `be-performance` / `be-security-engineering`.
- Setting on-call alerting thresholds (that is `ops-monitoring-alerting`).
- Inventing NFRs no stakeholder cares about — every NFR is a cost to test and maintain.

## Process

### Step 1 — Elicit the loading question first

Before ANY number: what is the **expected load and growth** (users, requests/sec, data volume, burst behavior)? An NFR without a load assumption is a slogan. If the team cannot estimate load, the first NFR is a measurement program, not a target.

### Step 2 — Quantify each category that binds

| Category | Quantify as |
|---|---|
| **Performance** | Latency budget with percentiles (p50/p95/p99) and a load assumption; throughput (req/s); response-size upper bounds |
| **Availability** | A target expressed as SLO, e.g. 99.9%/month with a documented error budget; define what counts as an outage (not just uptime) |
| **Security** | Data handling classes (PII, PCI, credentials); compliance list; ratified controls for each (`be-security-engineering`) |
| **Cost** | A budget ceiling: infra cost per unit (per 1k requests, per 100k events), with the growth slope it allows |
| **Compliance** | The specific regulations/SOC/GDPR/HIPAA items that apply, per data class, with audit evidence required |
| **Scalability** | The load point beyond which the design must change (scale target), and the mechanism for it |
| **Recoverability** | RTO/RPO for each data-critical flow: how fast restored, how much loss allowed |
| **Maintainability** | Mean-time-to-change for a standard change (a development-team NFR, as honest as the rest) |

Every NFR needs: the **target**, the **load/context assumption**, the **measurement method**, and (wherever possible) an **owner**.

### Step 3 — Pick the binding few

Most systems have 2–4 NFRs that genuinely bind; the rest follow from the design once the binding ones are met. For each candidate: "if we missed this by 10x, would the product fail?" — NO → drop or soften it. A catalog of twelve equally-weighted slogans designs nothing and reviews nothing.

### Step 4 — Make them design-native and conflict-explicit

- Hand the binding NFRs to design explicitly: latency budget → profile/design path (`be-performance`); availability → redundancy and failure behavior (`be-microservices-patterns`); cost → storage/instance shape.
- **Conflicts are the design work**: lower cost vs higher availability, faster vs cheaper. Do not hide them — record the chosen trade-off per conflict in the ADR (`fnd-adr`), with the deciding force named.

### Step 5 — Specify the verification method per NFR

Each NFR ships with how it will be proven: load test with the load model (`tst-performance-testing`), chaos/failure drill for recoverability, cost review per release for the budget, compliance evidence list for audit. An NFR with no verification method cannot be accepted, and cannot be regressed — it is a wish.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Just make it fast; the users will tell us" | Users tell you in the press and in churn after the outage; numbers are cheaper. |
| "99.99% — we're ambitious" | Ambition without mechanisms is a paper SLO; design the redundancy that earns it. |
| "Cost is trivial at our scale" | Then quantify the triviality: a per-unit budget that is genuinely cheap shows it. |
| "Security: we follow best practices" | An unbounded list of practices is unverifiable; bind the data classes and the controls. |
| "We'll test performance after launch" | Post-launch is a customer outage; the load model exists at design time. |

## Red Flags

- "Fast/reliable/secure" with no number, load assumption, or owner
- NFRs with no verification method attached
- Ten NFRs all marked critical (the binding few were not selected)
- Availability targets with no failure-behavior design to back them
- Cost/availability conflicts resolved silently instead of recorded
- RTO/RPO absent for data-critical flows
- No load/scale assumption anywhere in the record

## Verification

- [ ] Load assumption stated (users, req/s, data volume, burst) before targets
- [ ] Binding NFRs quantified: target + context + measurement + owner
- [ ] Binding few selected; non-binding ones explicitly deprioritized
- [ ] NFRs handed to design; conflicts recorded with deciding forces (ADR)
- [ ] Verification method per NFR (load test, drill, cost review, evidence list)
- [ ] All claims on the "rationalizations" side converted into records, not vibes