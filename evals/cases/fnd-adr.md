# fnd-adr — eval case

## Scenario
"The team just decided over a call — no meeting minutes — to replace the event bus (RabbitMQ) with Kafka because the events team demands replay. Nothing is written down. Record the decision before it's forgotten."

The agent must produce a one-page ADR (Context/Decision/Consequences), place it in docs/adr/ with a sequential name, mark it Status: Accepted (decision is committed, not just proposed), and NOT write system-state documentation.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] A place for ADRs was used (docs/adr/) with sequential numbering
- [ ] The ADR is one page: Status, Context, Decision, Consequences
- [ ] Decision contains the trade-off explicitly (replay capability vs. operational cost)
- [ ] Status reflects reality (Accepted only if the switch is committed — otherwise Proposed)
- [ ] No history editing of a prior ADR; supersession cross-linked if relevant
- [ ] No rationalization ("it was decided on a call, don't bother")