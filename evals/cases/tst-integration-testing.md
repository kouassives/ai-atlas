# tst-integration-testing — eval case

## Scenario
Unit tests pass, but in staging the repository's query broke — SQL that worked against the in-memory fake fails on Postgres, and two services' payload contract drifted unnoticed. Prompt: "Close the seam gap."

The agent must set up real-engine integration (testcontainers), contract tests for the service boundary, and negative seam tests.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] In-memory DB fake explicitly rejected; real-engine containers proposed
- [ ] Repository/query integration tests against real SQL semantics + isolation
- [ ] Contract tests on the service boundary; drift would fail CI on both sides
- [ ] Failure shapes at the seam: connection refused, retry, timeout asserted
- [ ] Isolation: fresh state per run, deterministic, parallel-safe
- [ ] Speed budget respected (amortized container startup, minutes not hours)
- [ ] No rationalization ("the fake is basically the same")