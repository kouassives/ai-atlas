---
name: ops-monitoring-alerting
description: "Defines SLOs and error budgets, burn-rate alerting, actionable alert rules, runbooks, and on-call escalation practice. Use when the pager is noisy or missed, when there is no SLO to alert against, when alert rules are blips instead of budgets, or when on-call cannot act from the alert text."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: devops
  sdlc-stage: operations-maintenance
  version: 1.0.0
---

# Monitoring & Alerting

## Overview

An alert is a page to a human — the most expensive unit of attention a software system produces. Alerting design is therefore mostly **elimination**: pages must fire only when they require a human now, carry everything needed to act, and know which system promise they are protecting. SLOs give alerting its backbone: you alert at the rate of error-budget burn, not at the first blip.

## When to Use

- Defining alerting for a new service or SLO.
- Pages are noisy (op's sleep is destroyed, real issues get lost) or nothing pages and incidents idle.
- There is no SLO, so every metric is alerting on vibes.
- On-call cannot act from the alert text (no runbook, no context).

**When NOT to use:**

- The signals/logging/metrics themselves — that is `ops-observability`; incident response process beyond pagers — escalation/runbook practice is downstream.

## Process

### Step 1 — Write the SLO first, alert against it

- An SLO is a quantified availability objective (`arch-nfrs` §2): e.g. "99.9% of requests < 300ms, monthly". It is a REAL promise with an error budget (the allowed failure window).
- SLOs are chosen by what users actually feel (latency/availability of the user journey), not by "the service was up".
- Without an SLO, there is no principled answer to "should this page?".

### Step 2 — Alert on burn rate, not on get-high-then-page

- **Burn-rate alerting**: page when the error budget is being consumed faster than planned for long enough to matter. Example: page when budget burns at 14.4× for ≥ 1h (a "violation is certain" trigger) with sensible fast/slow burn windows.
- Do NOT alert "error rate > 5% for 5 minutes" — that pages on blips that the budget absorbs and misses the slow bleed that would burn the budget by month-end.
- Alert level matches certainty: **page** only when action is required now; **ticket/warn** when something is trending and a human should look this shift.

### Step 3 — Make alerts actionable or they are not alerts

Every page must answer, in one screen, the three questions:
1. **What is broken** (the SLO/experience it threatens)
2. **How sure/how bad** (burn rate, affected scope)
3. **What to do** (runbook link, first triage step, who to escalate)

An alert with no runbook or no owner is a notification, not an alert. Write the runbook when the alert is created, not during the incident.

### Step 4 — Triage the noise until the pager is trusted

- Track page volume and page-to-action ratio per SLO. A page sysrem that produces no action is debt.
- Suppression only ever lasts until a fix lands: silenced alerts are tracked with owners and expiry — a silent pager is a schedule for failure.
- After every incident: was the page RIGHT, MISSING, or WRONG? Feed the answer into the alert rules (this is the loop that makes the pager honest).

### Step 5 — On-call practice: the humans

- On-call engineers are protected by the alert design (no needless pages) and armed by runbooks (no guesswork pages).
- Escalation is explicit: primary → secondary → manager, with timeouts; no "someone will notice".
- Handover is the discipline: outstanding pages, ongoing incidents, and expiry of temporary suppressions are handed over in writing, not on vibes.
- Alert routing by ownership: the alert goes to the team that can act on it — a page to an ownerless queue is a broadcast.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Page on every 5xx spike, safety first" | Every-blip paging destroys the pager's meaning; the budget absorbs blips by design. |
| "No SLO yet, we'll alert on errors" | Without a budget, every rule is arbitrary and every debate is religious. |
| "The alert says 'errors high', the runbook is old" | Then the page is a doorbell with no door — write it at creation. |
| "Silencing this alert, it's noisy" | Silencing is only valid with an owner, an expiry, and a fix ticket. |
| "On-call means watching the dashboard" | That is what burn-rate alerting is for; watching is how you normalize failure. |

## Red Flags

- Alerts not backed by SLOs/error budgets
- Blip-based alert rules (pages that the budget should absorb)
- Pages with no runbook, no owner, no escalation
- Silences without owners/expiry; pager volume trending up with no action payoff
- "5xx > 5%" style rules instead of burn rates
- A pager nobody trusts — the surest signal the design is broken

## Verification

- [ ] SLOs defined for user-visible journeys with error budgets
- [ ] Alerting via burn rate with page for certainty-now, ticket for trends
- [ ] Every page answers what/badness/action; runbooks exist at creation
- [ ] Noise triaged; suppressions owned+expiring; post-incident page review feeds rules
- [ ] Escalation explicit (primary→secondary→manager with timeouts); routing by ownership
- [ ] Handover discipline: pages, incidents, expirations written down