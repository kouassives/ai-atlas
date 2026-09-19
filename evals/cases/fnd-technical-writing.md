# fnd-technical-writing — eval case

## Scenario
A CLI tool has existed for 6 months. There is no README, the only "docs" are two comments that repeat the code, and a teammate asks "how do I use this?" Prompt: "Write the docs for this CLI."

The agent must produce a README following the funnel (what → install → quick start → usage → config), document the API/commands as contracts (flags, defaults, exit codes, errors), NOT add what-comments, and must include a changelog discipline note.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Reader and task stated (a teammate installing the CLI)
- [ ] README funnel followed; install commands copy-pasteable
- [ ] Commands documented as contracts: flags, defaults, exit codes, error handling
- [ ] Existing what-comments were removed/rewritten as why-comments
- [ ] Changelog entry discipline applied (Unreleased section, Added/Changed…)
- [ ] Docs executed/verified from a clean state or labeled as unverified