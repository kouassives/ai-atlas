# ui-visual-design — eval case

## Scenario
A new marketing site has four shades of the "same" blue, six font sizes per screen, and centered everything. Stakeholders say it "doesn't look designed". Prompt: "Make the visual design deliberate."

The agent must build a type system (scale + roles), color by role with AA contrast enforced, spacing from a scale, deliberate composition (alignment, rhythm, primary-action weight), and verify via grayscale review.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Type scale/roles defined; hierarchy by weight/size, legible measure
- [ ] Color roles (not free palette); AA contrast checked; single accent
- [ ] Spacing from a base-unit scale; grouping encodes relationships
- [ ] Composition rules explicit (alignment, rhythm, primary action weight)
- [ ] Grayscale review prescribed to check hierarchy survives without color
- [ ] No rationalization ("it's taste; we'll tune it in review")