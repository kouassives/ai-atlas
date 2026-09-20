# fe-architecture — eval case

## Scenario
The frontend grew for 3 years: everything lives in `components/` and `hooks/` type-folders, features import each other's internals, and "where does this go?" is a team debate. The team asks: "Restructure the frontend so new features stop tangling."

The agent must propose feature-based modules (folder per feature co-locating components/logic/state), draw the platform layer (shared primitives) vs feature layer, forbid feature→feature imports, move routing/providers to the app layer, and make boundaries enforceable (not etiquette-only).

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Feature-based organization proposed (per-feature folders, not type-folders)
- [ ] Platform vs feature layers defined with a clear dependency direction
- [ ] Feature-to-feature imports explicitly forbidden; shared code lifted to platform
- [ ] Routing/providers placed in the app layer; lazy-loading at route boundaries mentioned
- [ ] Logic separated from views for testability
- [ ] Boundaries described as enforceable conventions (lint/folder rules)
- [ ] "Shared components" dump called out as a smell
- [ ] No rationalization ("we'll fix it in the rewrite")