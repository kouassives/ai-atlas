# fe-api-integration — eval case

## Scenario
Every screen fetches its own data on mount, there are five different "loading" flags, errors show nothing but a spinner, and a slow network turns the settings page into a hang. Prompt: "Make the API layer sane."

The agent must centralize server data in a cache keyed by query identity (no duplicate fetchers), unify data/loading/error states with recovery paths (retry button, no infinite spinner), retry only transient failures with backoff, add timeouts that conclude, and use optimistic updates only where rollback is exact.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Single cache keyed by query identity; per-mount fetching called out and removed
- [ ] data/loading/error returned as one unit; skeleton vs background refresh distinguished
- [ ] Error state carries a user recovery path; infinite spinners rejected
- [ ] Retry discipline: transient-only, backoff, capped; 4xx never auto-retried
- [ ] Timeout behavior defined so hanging requests conclude
- [ ] Optimistic updates limited to safe mutations with exact rollback
- [ ] Cache invalidation after mutations (declarative), not ad-hoc refresh calls
- [ ] No rationalization ("a spinner until it loads is fine")