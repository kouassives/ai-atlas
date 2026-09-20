---
name: ui-usability-testing
description: "Validates designs with real users: test plans, moderation, finding synthesis, and iteration. Use when validating a design with real users, when a flow fails or drops users without explanation, or before shipping changes that touch core journeys."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: ui-designer
  sdlc-stage: testing
  version: 1.0.0
---

# Usability Testing

## Overview

Usability testing is the evidence loop for designs-with-users: **a plan** (what are we learning), **moderated sessions** (tasks with real users, thinking aloud), **synthesis** (finding the pattern in the pain, not the loudest complaint), and **iteration** (the findings change the design, which gets re-tested). It is distinct from QA: QA asks "does it meet the spec?" (`tst-*`); usability asks "can the user actually do the thing?". Five users find most of a flow's problems — this is a cheap, repeatable gate.

## When to Use

- A core flow fails, drops users, or generates tickets — before more build.
- Validating a design/prototype (from `ui-prototyping`) with real users.
- Shipping changes to critical journeys (checkout, onboarding, auth).
- Iterating: after a redesign, proving the fix fixed the finding.

**When NOT to use:**

- Functional verification against the spec (that is `tst-e2e-testing`).
- The question is preference/variation ("which logo?") — that is a taste question, not a usability question (handled with `ui-prototyping` A/B at most).

## Process

### Step 1 — Write the plan before booking a session

- The plan states the learning goal (the finding you seek), the tasks (scenarios the user does, not features you demo), the participants (who, from `ui-ux-research` personas, minus "team and friends"), the metrics (task success, time, errors, hesitation points) and the states to test (happy path + the error/empty edges).
- A plan without a learning goal produces a highlights reel, not a finding.

### Step 2 — Moderate to surface behavior, not approval

- Give tasks, do not showcase: the user performs; you observe and ask "what are you expecting here?" — never lead ("this button… try pressing it" is invalid).
- Thinking-aloud protocol; note where the user hesitates, backtracks, or improvises a workaround — behavior beats stated opinion.
- Run ~5 users per round per segment; the marginal value of user 9 on the same flow is near zero — spend the budget on the next flow.

### Step 3 — Synthesize findings, not complaints

- Code the observations into patterns: count the users who hit the same confusion; a finding that one user has is an anecdote, two is a pattern, three is the headline.
- Rank by severity × frequency against the learning goal; attach evidence (quote/behavior/timestamp) to every finding so iteration can target it.
- Separate root causes from symptoms: "users don't find the button" may be IA (`ui-ux-flows`), affordance (`ui-visual-design`), or label — the synthesis names the layer.

### Step 4 — Close the loop by iterating

- Each finding becomes an actionable change with an owner and a re-test plan (same task, same segment, next round). A finding that changes nothing is a session that produced only spectator value.
- Track the deltas across rounds: the metric should move (task success up, hesitations down) — a redesign that retested WORSE is a finding too.
- Round 1 with a prototype (cheap, per `ui-prototyping`) before Round 2 on the real build: the same loop applies at every fidelity.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We tested with the team, it was fine" | The team knows the design; the test exists for everyone who doesn't. |
| "Users told us it was great" | Approval in a session is politeness; behavior is the evidence. |
| "Ten users gave us plenty of opinions" | A shopping list of opinions is not a rankable, evidence-backed finding set. |
| "We don't have a lab" | A laptop, a room, five users, and a recorder is a lab. |
| "We'll iterate after launch" | Post-launch iteration is the same loop, with production users as the lab. |

## Red Flags

- No written plan or learning goal
- Team-and-friends participants; showcasing instead of tasking; leading questions
- Anecdote-level synthesis ("one user said…") treated as findings
- Findings with no severity/rank/evidence; no root-cause layer named
- No iteration loop — sessions that never re-test changed designs
- Testing only the happy path

## Verification

- [ ] Plan exists: learning goal, tasks, participants (real segment), metrics, edge states
- [ ] Sessions moderated non-led; behavior and hesitations captured
- [ ] ~5 users per round per segment; synthesis coded into patterns
- [ ] Findings ranked (severity × frequency) with evidence and root-cause layer
- [ ] Every finding → action + owner + re-test plan; deltas tracked across rounds
- [ ] Prototype round precedes build round where the question is still design-level