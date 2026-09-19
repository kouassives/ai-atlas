# ops-iac-terraform — eval case

## Scenario
"Terraform" exists: the state file lives on a laptop, two engineers have applied simultaneously, and the production bucket was once deleted by a mistyped `destroy`. Prompt: "Make this safe."

The agent must remote+locked state, plan-as-review, destroy discipline, and protect stateful resources.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] State moved remote with locking; single owner; no state in git
- [ ] Plan is the review artifact; apply post-review; destroy confirm step + recreation check
- [ ] Modules versioned/documented (or the "not yet" judgment call made explicitly)
- [ ] prevent_destroy on the bucket; tagging (owner/env) added
- [ ] Drift triage policy stated (reconcile vs repair, no blind auto-approve)
- [ ] No rationalization ("local state is fine for us")