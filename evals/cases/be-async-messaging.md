# be-async-messaging — eval case

## Scenario
A service publishes `order_placed` to a queue. Two consumers want to react independently, so the team says "queues handle that". Consumers confirm before the business work is durable and duplicates are corrupting state. Nobody knows how to re-process last week's events. Prompt: "Sort out the messaging."

The agent must: choose topic/stream over queue for the fan-out, state at-least-once, fix ack-after-durable-process, specify idempotency, add DLQ + lag alerts, and design replay.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Queue-vs-topic decision made by fan-out intent; stream with retention preferred
- [ ] Delivery contract stated: at-least-once; "exactly-once" never used
- [ ] Ack-after-durable-process fix specified; poison messages → DLQ with owner
- [ ] Idempotent consumers mandated (dedup by ID + idempotent operation)
- [ ] Retry via broker machinery; no hand-rolled sleep-retry loops
- [ ] Replay plan: retention sized, replay-safe by idempotency, ordering constraint documented
- [ ] Consumer lag monitoring + alerting included
- [ ] No rationalization ("duplicates are rare")