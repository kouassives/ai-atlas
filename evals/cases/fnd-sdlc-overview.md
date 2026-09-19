# fnd-sdlc-overview — eval case

## Scenario
"We're starting a brand new e-commerce project from scratch. It's a greenfield build — walk me through everything we need to do."

The agent must not start writing code. It must classify the request as spanning multiple SDLC stages and produce the map of stages, owning roles, and exit criteria.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] The agent classified the request into stages and named the earliest owning stage
- [ ] The agent named the owning role and skills per stage (no code written)
- [ ] The agent explicitly checked exit criteria (missing requirements surfaced, not invented)
- [ ] The agent delivered a self-contained stage map with handoff artifacts
- [ ] No rationalization past a missing upstream artifact ("we'll figure it out as we code")