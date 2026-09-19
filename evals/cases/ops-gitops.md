# ops-gitops — eval case

## Scenario
Deployments are kubectl one-liners from laptops and a hotfix edited prod directly last week. Nobody can reconstruct what runs. Prompt: "Move us to Git-driven delivery."

The agent must make Git the single source of truth, reconcile with visible drift, promote via PRs, and make rollback a routine revert.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Git holds full desired state; manual edits framed as incident, not shortcut
- [ ] Reconciliation policy per environment; auto-sync NOT run blind over drift
- [ ] Promotions are PRs with diff + smoke gate + approval where needed
- [ ] Rollback = previous commit, reproducible; images immutable
- [ ] Operator health/sync monitored (last sync visible)
- [ ] CI pushes artifact, GitOps promotes — credential separation
- [ ] No rationalization ("hotfixing prod is faster")