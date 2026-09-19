---
name: be-api-design
description: "Designs and implements APIs: REST vs GraphQL vs gRPC selection, resource modeling, status codes, validation, pagination, idempotency, and versioning. Use when creating or extending an API, when choosing an API style, when endpoints lack standard status semantics, or when clients need stable contracts and retry behavior."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: backend
  sdlc-stage: implementation
  version: 1.0.0
---

# API Design

## Overview

An API is a contract your organization ships — every client is a stakeholder you cannot call a meeting with. This skill covers the decisions that make or break that contract: transport style, naming and resource modeling, status and error semantics, pagination, idempotency, and versioning. The goal is APIs that clients can consume safely, retry blindly, and upgrade without breakage.

## When to Use

- Designing a new endpoint, resource, or API surface.
- Extending an existing API (adding fields, endpoints, or behaviors).
- Choosing between REST, GraphQL, or gRPC for a service-to-service or public interface.
- Reviewing an API for contract quality (status codes, errors, idempotency).

**When NOT to use:**

- Internal function/method interfaces (that's class design — see `be-solid-principles`).
- Event/message contracts (that's `be-async-messaging`).
- Designing the transport of the stack itself (pick a standard, don't invent).

## Process

### Step 1 — Choose the style by consumption pattern

| Pattern | Prefer |
|---|---|
| Public web/CRUD, diverse clients, caching, browser reach | **REST** (JSON) |
| Client-controlled shapes, mobile apps, product data graphs fans | **GraphQL** |
| Polyglot service-to-service, streaming, strict schemas, high throughput | **gRPC** |
| Internal team, few clients, simplest possible | REST |

Don't layer a second style until the first has a demonstrated failure, not a hypothetical one.

### Step 2 — Model resources, then verbs

- Resources are **nouns, plural**: `/orders`, `/users/{id}`. Actions that are not CRUD either become sub-resources (`/orders/{id}/cancel`) or custom verbs only where resource semantics force it.
- Deep nesting >2 levels is a design smell (`/companies/{c}/departments/{d}/employees/{e}`) — flatten with references.
- Field and resource names: kebab-case URLs, snake_case JSON (or your org's stored convention — pick one, document it, be consistent); naming is part of the contract.

### Step 3 — Status codes are semantics, not decoration

- `201` for creation (with `Location`), `200` for reads/updates, `204` for deletions.
- `400` malformed syntax **vs** `422` semantically invalid — pick per operation and document which.
- `401` unauthenticated, `403` authenticated-but-forbidden, `404` absent (never leak "exists but no access" unless intentional).
- `409` conflict (idempotency key reuse with different payload, optimistic locking), `429` rate-limited (with `Retry-After`).
- **Never** return `200` with an error body, and never map application logic onto `5xx`. 5xx means "the server broke", not "the business case failed".

### Step 4 — Errors are a contract too

```json
{
  "error": {
    "code": "order_id_required",
    "message": "order_id is required and must be a UUID",
    "field": "order_id",
    "request_id": "req_9f2c..."
  }
}
```

Stable machine-readable `code`, human `message`, offending `field`, and a `request_id` for support. Document per endpoint: codes, statuses, retry semantics.

### Step 5 — Pagination, filtering, idempotency, versioning

- **Pagination**: cursor-based for dynamic data (`?cursor=` → `next_cursor`), page/offset fine for static lists; always cap page size and return the cap in the payload.
- **Filtering**: query params with explicit allowed fields (`?status=paid&from=2026-01-01`), never open-ended arbitrary expressions.
- **Idempotency**: on state-mutating ops, accept a client `Idempotency-Key`; store key+response; replay returns the stored response (`200`/`201` as first sent); `409` on key reuse with a different payload. Document that retries are safe — this is what makes blind retries possible.
- **Versioning**: URL `v1` for breaking public contracts; additive changes (new fields/endpoints) never bump the version. Deprecate with a documented sunset date; never break silently.

### Step 6 — Validate at the boundary

Types, formats, ranges, required-ness enforced at the API boundary per `fnd-security-basics`, before any business logic. Validation errors are `400/422` with field-level detail, not exceptions.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "200 with an error field is easier for clients" | Clients must then inspect bodies on every success — the contract is two contracts. |
| "We'll version when we break" | Versioning added at breakage time is a migration crisis; version cheaply at day one. |
| "REST is overkill, one mega-endpoint is fine" | A mega-endpoint serializes clients and kills independent evolution. |
| "gRPC is faster so we use it everywhere" | Adoption cost exists for every client; choose by consumption pattern, not microbenchmarks. |
| "We return 500 for validation, the client should just retry" | The client can't fix a request the server calls a crash — they get stuck. |

## Red Flags

- Endpoints returning 200-with-error-body or 500-on-business-case
- No idempotency on retry-sensitive mutations (payments, orders, intents)
- Versionless public APIs, or version bumped for additive changes
- Unbounded list endpoints returning everything with no cursor/cap
- Error responses without stable codes or request_id
- Deep nesting or verb-named resources (`/getOrderData`)

## Verification

- [ ] Style chosen by consumption pattern with rationale
- [ ] Resources noun-plural; nesting ≤2; naming convention documented
- [ ] Status codes mapped per semantics; no 200-error or 500-business
- [ ] Error contract documented: code/message/field/request_id per endpoint
- [ ] Pagination capped and cursor/paging consistent
- [ ] Mutations accept and honor `Idempotency-Key`
- [ ] Versioning present for breaking contracts; additive changes don't bump
- [ ] Input validated at the boundary with field-level errors