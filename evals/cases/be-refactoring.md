# be-refactoring — eval case

## Scenario
`legacy_importer.py` (900 lines) works, has zero tests, and the next feature cannot be added without touching its guts. Team culture: "big-bang rewrite, then feature". Prompt: "Make the feature possible safely."

The agent must: characterize behavior with the net first, find/create seams, refactor in small verified increments, refactor-only commits, and refuse to mix the feature in.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Characterization tests written FIRST to pin current behavior including oddities
- [ ] Seams identified/created with zero behavior change
- [ ] One smell per increment, each leaving the suite green; increment too big → bisected
- [ ] Refactor commits explicitly separated from any feature work
- [ ] Boundary behaviors (ordering, nulls, error paths) pinned
- [ ] Final verification: suite green, diff reviewable as moves-only
- [ ] No rationalization ("rewriting is faster than refactoring") — rewrite only rejected explicitly with cost reason