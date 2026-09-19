# arch-system-design — eval case

## Scenario
A team must build a reporting feature streaming from an event bus into a dashboard. Suggestion on the table: "pump everything into one Postgres table and query it in the frontend." Prompt: "Design this before anyone writes code."

The agent must produce: constraints/NFRs, components with ownership boundaries, data/control flow including failure paths, trade-off analysis for the storage choice, and failure behavior.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] NFRs stated up front (latency, scale, retention) and referenced by decisions
- [ ] Components one-responsibility each with ownership boundaries; dependencies via interfaces
- [ ] Data/control flow drawn — traceable end-to-end, WITH failure paths
- [ ] Storage/architecture decision has alternatives + accepted cost line
- [ ] Mapping to established architecture style declared
- [ ] The "single table + frontend queries" shortcut explicitly rejected or bounded with rationale
- [ ] Artifact small enough to review