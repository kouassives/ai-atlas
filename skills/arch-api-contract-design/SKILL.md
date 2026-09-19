---
name: arch-api-contract-design
description: "Defines public interfaces contract-first: OpenAPI, versioning, error semantics, backward compatibility, and Hyrum's Law. Use when defining public interfaces, when designing contracts before implementation, when a public API must stay backward-compatible, or when clients depend on behavior the spec never promised."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: architect
  sdlc-stage: design
  version: 1.0.0
---

# API Contract Design

## Overview

A public API is a contract with clients you do not control. **Contract-first** means the specification IS the product: it is written, reviewed, and versioned before (and independent of) implementation. This skill covers spec-first design, versioning and backward compatibility policy, error semantics as part of the contract, and the uncomfortable truths of Hyrum's Law — clients depend on everything, including your bugs.

## When to Use

- Defining a public or cross-team interface (HTTP, SDK, events, RPC).
- Designing the contract before implementation, or reviewing an existing contract's spec.
- Planning a breaking or additive change to a public API.
- Onboarding partners/clients who will build against the spec, not the code.

**When NOT to use:**

- Endpoint implementation details (status codes per operation, idempotency mechanics) — that is `be-api-design`.
- Internal function signatures (that is class/module design — `be-solid-principles`).
- Choosing REST vs GraphQL vs gRPC itself — decide the style first (`be-api-design`), then contract-design it.

## Process

### Step 1 — Make the spec the first-class artifact

- HTTP: an **OpenAPI** document (or equivalent typed schema) that is the single source of truth; generated from it (or verified against it by contract tests), never maintained by hand in parallel.
- Events: typed schemas with versioning (`be-async-messaging` for delivery semantics).
- The spec is reviewed like code: schema, semantics, examples, and error surface. If the spec is unreadable, the implementation will be a guess.

### Step 2 — Encode semantics in the schema, not the prose

- Types, formats, requiredness, enums (and their extension rules), nullable-vs-optional disambiguated explicitly.
- Every field documented with: meaning, constraints, example, and what clients may assume about it across versions.
- Response shapes are versioned artifacts; a field is never repurposed silently ("was string, now means something else").

### Step 3 — Define error semantics as part of the contract

- Error vocabulary per operation: codes, status mapping, retryability bit (`be-api-design` for the mechanics).
- The spec must state, per operation, what happens on timeout, on validation, and on conflict — or clients must GUESS, and guesses become Hyrum dependencies.

### Step 4 — Version the surface, define the compatibility policy

- **Additive changes** (new endpoints/fields/params): allowed without a version bump; MUST NOT break existing consumers.
- **Breaking changes** (removed/renamed/repurposed fields, tightened constraints, changed semantics): only under a new version, with a documented migration and sunset date.
- State the policy in the spec header: what you consider breaking. Clients then know what a minor spec update may contain.
- Never version for internal restlessness; every version is a parallel contract you maintain.

### Step 5 — Respect Hyrum's Law

Assume clients depend on: exact error strings, field ordering, pagination shapes, timing quirks, and even documented-as-internal responses. So:
- Test the documented contract AND the de-facto surface (capture real client traffic/assertions).
- Remove nothing "nobody should depend on" without a deprecation notice and a dead-code window.
- Document what is safe to change (the compatibility policy above) so clients know which dependencies are protected.
- If a de-facto behavior is load-bearing, promote it into the contract — the law stops being a surprise once the dependency is declared.

### Step 6 — Validate contracts with contract tests

- Contract tests assert the running implementation matches the spec (request/response schemas, error codes, version rules).
- These tests are the counterpart to `tst-integration-testing`: they protect the promise even when providers and consumers evolve independently.
- Example payloads in the spec double as test fixtures — keep them real and current.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The implementation is the source of truth" | The day the implementation changes, "truth" changes with it and clients break silently. |
| "We document breaking changes in the changelog" | Changelogs are for humans who read them; versions and sunset dates are the machine-checkable part. |
| "Field X was never public, deleting it is fine" | Hyrum's Law says otherwise — deprecate, then delete after the window. |
| "One more field won't hurt" | Additive is fine — as long as the field name, meaning, and type stay stable forever after. |
| "OpenAPI is boilerplate overhead" | It is the only artifact both sides can read, review, and test against without a phone call. |

## Red Flags

- Implementations that drift from the spec with no contract test catching it
- Breaking changes shipped in "minor" spec updates
- Fields repurposed, tightened, or removed with no deprecation window
- Error semantics absent from the spec (clients guessing statuses)
- De-facto behaviors depended on by real traffic with no promotion into the contract
- A spec so stale it documents systems that do not exist

## Verification

- [ ] Spec is the single source of truth, machine-readable (OpenAPI/typed schemas)
- [ ] Semantics encoded in schema: types, formats, requiredness, enums, nullable-vs-optional
- [ ] Error vocabulary and retryability defined per operation
- [ ] Versioning policy stated; additive-only without bumps; breaking under new versions + sunset
- [ ] Hyrum review done: de-facto surface captured (traffic assertions) and promoted where load-bearing
- [ ] Contract tests verify the implementation against the spec continuously
- [ ] Examples in the spec are real and current