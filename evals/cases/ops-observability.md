# ops-observability — eval case

## Scenario
An incident took 6 hours because logs were prose across 5 services, latency was reported as an average, there were no traces, and "dashboards" were 30 unread panels. Prompt: "Make this system observable."

The agent must structure logs with correlation ids, RED/UUSE metrics with percentiles, tracing at boundaries, and question-driving dashboards.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Structured logs with correlation ids propagated; no secrets/PII in logs
- [ ] RED metrics with percentiles, USE for resources; useful tags without cardinality explosion
- [ ] Tracing at boundaries; traces joinable to logs and metrics
- [ ] Dashboards answer named questions; unread panels pruned
- [ ] Metrics feed alerting (orientation toward ops-monitoring-alerting)
- [ ] Observability in the DoD, not retrofitted
- [ ] No rationalization ("the averages looked fine")