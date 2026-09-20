# fe-responsive-design — eval case

## Scenario
The marketing page was built desktop-first with fixed pixel widths and now has nine breakpoints nobody can explain, the header overflows on a 390px phone, and the sidebar component only works in one place. Prompt: "Fix the responsive behavior."

The agent must prescribe mobile-first (base styles = phone, min-width queries enhance), fluid layout (grid/flex, minmax, clamp, auto-fit) before structural breakpoints, a short owned breakpoint list (structural only), container queries for components adapting to their placement, and verification across the real spectrum including zoom and landscape.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Mobile-first base prescribed; desktop-first called out as the root problem
- [ ] Fluid techniques named (minmax/fl fr/clamp/auto-fit) before breakpoints
- [ ] Breakpoints structural and few; cosmetic breakpoints rejected
- [ ] Container queries proposed for the sidebar component's placement adaptation
- [ ] Overflow handling (min-width:0, max-width:100%, unbreakable content)
- [ ] Verification on the real spectrum (small phone, zoom 200%, landscape)
- [ ] No rationalization ("desktop is where the users are")