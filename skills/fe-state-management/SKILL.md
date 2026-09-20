---
name: fe-state-management
description: "Chooses state architecture: local vs global vs server state; store, hook, and context patterns; and when each applies. Use when choosing state architecture, when state is duplicated or prop-drilled, when global stores grow without bound, or when server data and UI state are tangled."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: frontend
  sdlc-stage: implementation
  version: 1.0.0
---

# State Management

## Overview

Most frontend state bugs are not bugs in state libraries — they are state in the wrong home. This skill is the placement discipline: **local state stays local, server state is cached (not duplicated), and global state earns its place only for truly shared UI state**. The rule of thumb: when in doubt, the answer is local state, lifted at most to the nearest common parent.

## When to Use

- Starting or reviewing state architecture for a feature or app.
- Prop-drilling is painful, or state is duplicated in several components and desyncs.
- A global store keeps growing and nobody can say which state is "global" and why.
- Server data and UI state are tangled (loading flags living in the global store).

**When NOT to use:**

- The component already works with local state and no sharing needs exist (YAGNI — do not pre-architect state).
- Choosing between specific libraries — this is the when/where logic that library choice executes.

## Process

### Step 1 — Sort state into its three homes

| State | Home |
|---|---|
| Form input, toggles, ephemeral UI | **Local** (component state/hooks) |
| Data from the server (lists, profiles, docs) | **Server-state cache** with fetch/cache/invalidate semantics |
| UI state many unrelated components must agree on (auth session, theme, active locale, notifications) | **Global** store/context |

If state does not clearly fit the third row, it does not belong globally — the global row is the smallest row.

### Step 2 — Lift locally before going global

- Two components share a bit of state → **lift it to their nearest common parent** (props in, events up). That is still local state — at the parent.
- Context/theme-style sharing for genuinely inherited UI state (theme, locale, session) is fine — that is injection, not a global store.
- Ask the question in order: local → lift → context/hooks → global store. Jumping straight to a store for one shared boolean is how stores grow.

### Step 3 — Treat server data as cached state, not duplicated state

- Server data gets ONE trustable holder: a server-state cache (fetch/cache/invalidate, SWR-style, query-client) owned by data shape (key = query identity).
- Never copy server data into the global store as a second source of truth — that is desync by construction. Derive/select from the cache instead.
- Loading/error/refetch logic belongs to the cache layer, not scattered as per-component booleans (`fe-api-integration` owns the mechanics).

### Step 4 — Normalize global state

- Global state shape is normalized (entities by id, references by id), derived state computed, not stored — duplication at global scale is the same bug as local duplication, amplified.
- Every global store slice has an owner-feature and a written "why global" note — a store with slices nobody can justify is tech debt with a badge.

### Step 5 — Keep updates predictable

- Mutations go through one mechanism per store (actions/reducers/updaters); no component writes global state directly then re-reads via a different path.
- Side effects of state changes (refetch, navigation, persistence) are explicit and testable — hidden `useEffect` chains on every global value are the frontend's spaghetti.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "A store for everything makes it consistent" | One store for everything makes every change available to every component — coupling masquerading as consistency. |
| "We need it in the store 'just in case'" | Just-in-case global state is how stores grow props nobody reads. |
| "Copy the server data, it's simpler" | Duplicated server data is the most reliable desync in the frontend. |
| "Context everywhere is the modern way" | Context is injection; using it as a store has the same global-coupling cost with worse tooling. |
| "We'll refactor to the right home later" | State placement refactors touch every component that touched the state — now or never. |

## Red Flags

- Server data duplicated into the global store
- Global store slices with no ownership or no "why global" justification
- Prop-drilling solved by store instead of lifting
- Derived values stored instead of computed
- Components writing global state through ad-hoc paths
- Loading/error flags scattered as UI state instead of cache state

## Verification

- [ ] Each piece of state placed in its correct home (local / lifted / cache / global-injected)
- [ ] Lifting tried before global; store rows justified with an owner
- [ ] Server data single-homed in the cache, derived elsewhere, never duplicated
- [ ] Global state normalized; derived state computed
- [ ] Mutations single-mechanism; side effects explicit and testable
- [ ] No store slices without justification ("why global" written)