# ui-prototyping — eval case

## Scenario
The team wants to validate a new onboarding concept, but the product lead asks for "a high-fidelity mockup of everything" before any user has seen anything. Prompt: "What should we build to test this?"

The agent must select the cheapest fidelity that answers the pending question (concept → sketch/wireframe; interaction → interactive mockup), keep interactive paths complete, validate behaviorally with users, and throw the prototype away after extracting decisions.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Fidelity matched to the question; high-fidelity-for-everything rejected as waste
- [ ] Fidelity ladder articulated (sketch → wireframe flow → mockup → interactive)
- [ ] Interactive paths bounded and COMPLETE (no demo dead-ends); states included
- [ ] Validation with real users behaviorally, not stakeholder applause
- [ ] Prototype treated as evidence to be thrown away; decisions migrated to design/implementation
- [ ] No rationalization ("we'll prototype in the real codebase, we're fast")