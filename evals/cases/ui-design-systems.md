# ui-design-systems — eval case

## Scenario
Six teams share the codebase. Each team has its own button, its own warning color, and its own "dark mode hacks". Starter prompts an entry: "We need a design system."

The agent must extract a semantic token layer (raw values banned in components), codify the component library as contracts (states, a11y, usage), define theming as token-level manifests, document usage, and assign ownership with drift detection.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Design tokens extracted with semantic names; raw hex/px in components flagged as drift
- [ ] Component contract defined (API, states, a11y, responsive, usage rules)
- [ ] Theming via token manifests, not CSS-override sprawl; a11y parity verified
- [ ] Documentation with dos/donts and alternatives
- [ ] Ownership + drift detection (audits/lint/visual regression) mandated
- [ ] Duplicate components called out as forks, to be merged via extraction
- [ ] No rationalization ("we'll codify when we have time")