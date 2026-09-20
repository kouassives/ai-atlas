# fe-accessibility — eval case

## Scenario
A new modal closes on outside-click, opens a menu via mouse hover, has icon-only buttons, color-only error states, and no visible focus. A screen-reader user reports they cannot complete the flow. Prompt: "Fix the accessibility."

The agent must apply WCAG 2.1 AA: native semantics first (ARIA sparingly and as a contract), full keyboard operability with visible, managed focus (modal trap + restore), text alternatives and labels, contrast checked (4.5:1 text, 3:1 UI), and both automated checks and manual keyboard/screen-reader verification.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Native elements preferred; ARIA added only where native cannot do the job
- [ ] Keyboard end-to-end: reachable, operable, visible focus, no traps
- [ ] Modal focus management (trap + restore) prescribed
- [ ] Labels/alt text and announced errors; color-only information rejected
- [ ] Contrast thresholds (4.5:1 / 3:1) and target sizes named
- [ ] Automated + manual verification required (keyboard walkthrough, screen reader)
- [ ] No rationalization ("we'll do a11y after launch")