# ops-kubernetes — eval case

## Scenario
A Deployment: no resources, one liveness probe curling localhost in a shell, replicas=1, default rolling update, no PDB, and "rollback" = a screenshot of the old YAML in a wiki. Pods restart-loop. Prompt: "Make this workload healthy."

The agent must add requests/limits from evidence, correct probes, add replicas+PDB, and establish a real rollback record.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] requests+limits set on every container, justified by observed usage
- [ ] Readiness vs liveness distinguished; shell-in-image probe rejected; startupProbe considered
- [ ] replicas>1 with PDB; rolling update tuned for semantics
- [ ] Rollback: previous good state recorded and replayable, not a screenshot
- [ ] Pipeline waits on rollout status with timeout
- [ ] Networking least-privilege checked; config/secrets injected
- [ ] No rationalization ("single-replica is fine")