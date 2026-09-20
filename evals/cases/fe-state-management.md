# fe-state-management — eval case

## Scenario
The feature has form state, a server list, an auth session, and a theme. Half the team wants everything in a global store "for consistency"; another half wants server data copied into the store "so components can read it easily". Prompt: "Decide where this state lives."

The agent must place each state in its correct home: local state local, server data cached (never duplicated into a store), genuinely-shared UI state (session, theme) global/injected — and must order the decision local → lift → context → store.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Three homes articulated (local / server cache / global) with which state goes where
- [ ] Server data explicitly NOT duplicated into the store — cache as single source of truth
- [ ] Lifting to a common parent tried before going global
- [ ] Session/theme classified as shared global/injected state with justification
- [ ] Store growth concerns acknowledged ("just in case" store rows rejected)
- [ ] Normalization/mutation-single-mechanism mentioned for the global slice
- [ ] No rationalization ("store for everything = consistency")