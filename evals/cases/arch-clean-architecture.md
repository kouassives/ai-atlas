# arch-clean-architecture — eval case

## Scenario
The existing app's "business layer" imports the HTTP framework's request objects and the ORM entities everywhere; every change to the DB ripples through the domain. Prompt: "Give this code a backbone that survives."

The agent must produce the layer/ring structure, entities and use cases pure of I/O, ports owned by the core, adapters at the edge, a single composition root, and a swap story that proves testability.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] Layers + dependency rule drawn; arrows inward
- [ ] Entities/use cases defined without I/O or framework types (no HTTP/SQL/ORM in core)
- [ ] Ports (interfaces) owned by core; adapters outside; composition root as single assembly point
- [ ] DB swap provable as an adapter change by inspection
- [ ] Core testable without DB/HTTP demonstrated
- [ ] No ceremony layers; every layer delivers behavior
- [ ] No rationalization ("the framework IS the architecture")