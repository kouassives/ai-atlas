# be-microservices-patterns — eval case

## Scenario
Checkout spans 3 services and the team "just shares the database" so reads stay consistent. Events are published right after commit. When payments flake, every service retries instantly and one outage becomes three. Prompt: "Make this resilient."

The agent must reject the shared-DB shortcut, mandate the transactional outbox, specify saga with compensations, and fix retry/breaker/bulkhead + idempotent consumers.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Shared database explicitly rejected with the coupling rationale
- [ ] Transactional outbox mandated for event production; loss window named
- [ ] Saga chosen with compensations per side-effecting step; orchestration considered
- [ ] Retry (capped/backoff/jitter), circuit breaker, bulkhead applied to the flaky dependency
- [ ] At-least-once stated; idempotent consumer layers specified (dedup + idempotent op)
- [ ] Pattern selections recommended for ADR record
- [ ] No rationalization ("exactly-once is fine at our scale")