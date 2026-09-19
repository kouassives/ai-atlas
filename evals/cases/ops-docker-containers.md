# ops-docker-containers — eval case

## Scenario
A Dockerfile: FROM ubuntu:latest, installs a compiler + package manager, ARG with an API key baked into ENV, runs as root. Image is 1.5GB and rebuilds take forever because source copies before dependencies. Prompt: "Fix this image."

The agent must multi-stage, minimal base, layer order for cache, secret hygiene, non-root runtime, and a scan in the loop.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Multi-stage build: toolchain in build stage, artifact-only final image
- [ ] Minimal pinned base; no package manager in runtime
- [ ] Layers ordered deps-before-source; cache keys are lockfile checksums; dockerignore
- [ ] ARG/ENV secret-folding explicitly rejected; build secrets prescribed
- [ ] Non-root USER, trimmed capabilities, read-only fs where possible
- [ ] Image scan added; size budget justified
- [ ] No rationalization ("ubuntu is fine, disk is cheap")