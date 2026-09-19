# be-database-design — eval case

## Scenario
A table stores `tags` as a comma-joined text column; a hot query filters on it with `LIKE '%tag%'` and is slow. Someone proposes "just add an index on tags and drop the old column next week." Prompt: "Fix the queries."

The agent must flag the repeated-column-group smell, fix normalization, design the join/filter correctly, index for the real query (leading-wildcard trap), and plan a safe expand-contract migration.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Comma-joined column flagged as a modeling defect (missing table), not an indexing problem
- [ ] `LIKE '%x%'` leading-wildcard indexed-fix rejected with rationale
- [ ] Index design driven by explain-plan, not guesses; write-cost of indexes acknowledged
- [ ] Migration: expand-contract for the column replacement; revert path considered
- [ ] Transaction scope discussed if the migration is multi-step
- [ ] No rationalization ("drop it fast, staging tests will catch it")