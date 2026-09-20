# fe-performance — eval case

## Scenario
The homepage LCP went from 2.1s to 4.8s after the latest release, the JS bundle grew 300KB, and scrolling the activity feed janks. The team proposes "just add memoization everywhere". Prompt: "Fix the frontend performance."

The agent must refuse blanket memoization, establish the Web Vitals budget and baseline (representative device, lab + field), profile to find the dominant cost, own the bundle (analyzer, code-splitting, dependency audit), address rendering cost (memoize by shape, virtualize, long tasks), optimize images/media (formats, srcset, preload, CLS space reservation), and verify before/after on the same metrics.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Blanket memoization rejected; profile-first demanded
- [ ] Web Vitals budgets + baseline (LCP/INP/CLS on a representative device) established
- [ ] Profile identifies dominant cost before optimizing
- [ ] Bundle owned: analyzer, offenders named, route-level splitting, size budget
- [ ] Rendering: memoize by shape, virtualization, long-task yielding
- [ ] Images: formats/srcset/preload for LCP; CLS via reserved space
- [ ] Before/after verified on the same metrics/device
- [ ] No rationalization ("it's fast on my dev machine")