# fe-component-design — eval case

## Scenario
A team's `Card` component takes 18 props: `variant`, `size`, `showHeader`, `layout`, `linkTo`, `onButtonClick`, `badge`, `footerCta`… Every new requirement adds a prop and a conditional. A junior asks: "Is this how we should build components?"

The agent must recognize the config-compound smell, prescribe composition over configuration (small assembled pieces), split presentational from container responsibilities, define an explicit prop/event contract (events up, data down), and apply the third-use rule before labeling anything "reusable".

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Config-compound (prop-per-requirement) explicitly diagnosed
- [ ] Composition solution proposed (small components/slots instead of new props)
- [ ] Presentational vs container split prescribed; logic extracted from view
- [ ] Prop/event contract made explicit: typed props, defaults, events up / data down
- [ ] Boolean-prop proliferation flagged
- [ ] Third-use rule: reusability earned, not declared in advance
- [ ] No rationalization ("one more prop won't hurt")