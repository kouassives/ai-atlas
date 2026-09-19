---
name: be-database-design
description: "Design database schemas and tables: table modeling, normalization vs denormalization, the index each query needs, transactions and isolation, and safe migrations. Use when designing or altering a table or schema, when choosing an index or planning a migration to add a column, when a query is slow, or before touching a data model."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: backend
  sdlc-stage: implementation
  version: 1.0.0
---

# Database Design

## Overview

The schema is the longest-lived contract in most systems — every service, report, and migration depends on it. This skill covers the decisions that protect that contract: modeling and keys, the normalization/denormalization trade-off, indexing for the queries that exist, transactions and isolation for the writes that happen, and migrations that can be shipped, rolled back, and reasoned about.

## When to Use

- Creating or altering tables, entities, or models.
- Designing a query, index, or access pattern.
- A query regresses or a table grows and queries degrade.
- Planning a migration or schema change that touches existing data.
- Choosing between a normalized relational shape and a denormalized/read-optimized one.

**When NOT to use:**

- Choosing a storage engine or managed DB product evaluation (that is `ops-` / `arch-` territory).
- Event/projection stores driven by `be-async-messaging` or CQRS read models follow their own rules.

## Process

### Step 1 — Model the truth, name it unmistakably

- Each entity gets a **stable primary key**. Prefer a surrogate key (`id` UUID/bigint) as PK; business keys are unique constraints, not PKs that get repurposed.
- One concept per table; columns typed and constrained (`NOT NULL` unless genuinely optional, `CHECK` for ranges, enums for closed sets).
- Foreign keys express ownership; index them. Denormalized copies of other tables' columns are flagged until justified (Step 3).

### Step 2 — Normalize by default (3NF), then decide

Start at **third normal form**: no partial-key dependencies, no transitive dependencies, no duplicate column groups (repeated columns = a missing table). From there, denormalize **only** when a measured query or a read-heavy path demands it — and do it deliberately:

| Denormalize when | Keep normalized when |
|---|---|
| Read-heavy aggregation/reporting path with measured latency problem | Writes dominate; update consistency matters |
| Hot read of derived data computed per request | Single source of truth must be authoritative |
| Read model / projection (CQRS) | One team, one model, writes and reads kept coherent |

A denormalized column demands a **write discipline**: document who updates it, in which transaction, and how it is reconciled.

### Step 3 — Index for the queries you run, not the ones you imagine

- Index columns in `WHERE`, `JOIN`, `ORDER BY`, `GROUP BY` — composite indexes ordered leftmost-by-selectivity-to-cardinality.
- **Partial indexes** and covering indexes for the hot paths; keep index count proportional to actual query load — each index taxes writes.
- Explain-plan before and after. If an index has never shown up in a plan, drop it.
- Beware the classic traps: index on `LOWER(col)` requires function-call duplication; leading-wildcard `LIKE '%x'` cannot use a B-tree index; OR-branches may need separate analysis.

### Step 4 — Transactions: scope them, know your isolation

- Wrap a unit of work, not a request: one transaction = one business invariant, minimal duration, no external calls inside (HTTP/messaging inside a transaction = lock hoarding and deadlock breeding).
- Choose isolation deliberately. Defaults exist for a reason: understand `READ COMMITTED` vs `REPEATABLE READ` vs `SERIALIZABLE` and document which level the operation needs. Optimistic locking (version/`updated_at` check) is the standard answer to lost updates — prefer it over escalating isolation.
- **Lock ordering**: acquire locks in a consistent global order to prevent deadlocks. Two services locking the same two tables in opposite orders is a scheduled outage.
- Never swallow a failed transaction and "continue" — the unit of work is atomic or it is not done.

### Step 5 — Migrations: forward and backward or not at all

- Every migration ships with a **forward** path and (for the migration window) a **backward/revert** path, or an explicit "not reversible, requires data backfill" note reviewed by a human.
- **Expand-contract** for breaking changes: add the new column/table (expand) → dual-write/backfill → verify → stop writing old → drop old (contract). Never drop a column that live code still reads; never rename in place without a shadow period.
- Migrations run in CI and against staging with a representative dataset; schema changes are reviewed like code (they inevitably gain `fnd-code-review` attention).

### Step 6 — Prove it on real shapes

Before done: explain-plan the queries the change touches, run the migration against staging data, and (for hot paths) a load check. If a query's plan surprises you, the index or the model is wrong — fix the data shape, not the query workaround.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We'll denormalize, it's read-heavy" | Read-heavy with no measured latency problem is still premature; measure first. |
| "Add an index, that fixes it" | An index only helps the plan that can use it — prove it with the plan, not the hope. |
| "One big transaction for the whole request" | Long transactions hold locks, serialize writes, and surprise you with deadlocks. |
| "Drop the column now, nothing uses it" | "Nothing" is never verified in production; expand-contract exists for a reason. |
| "The business key is obviously unique, use it as PK" | Business keys change meaning; surrogate PKs survive meaning changes. |

## Red Flags

- Repeated column groups or comma-joined values in a column (missing table)
- Denormalized columns with no documented writer/reconciler
- Indexes never exercised by any explain-plan
- External calls (HTTP/queue) inside a transaction
- ALTERs that drop/rename in one step with no expand-contract
- Migrations with no revert or no staging run

## Verification

- [ ] Entities keyed stably; business keys as unique constraints
- [ ] Normalized by default; every denormalization justified by a measured path with a documented writer
- [ ] Indexes justified by plans; no dead indexes; composite orders sane
- [ ] Isolation chosen deliberately; optimistic locking preferred over escalation; lock ordering consistent
- [ ] Migrations forward+revert (or explicit irreversible label), expand-contract for breaking changes, staged/data-representative
- [ ] Explain-plans and staging runs performed for touched queries