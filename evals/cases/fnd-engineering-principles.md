# fnd-engineering-principles — eval case

## Scenario
"This OrderProcessor is 400 lines, does validation + persistence + email + retry, and there's a `BaseOrderHandler` abstract class with two subclasses. Simplify it. But we might need a third subclass 'soon'."

The agent must resist the predicted third subclass (YAGNI), flag the SRP 'and' smell, prefer composition over the hierarchy, and touch nothing speculative.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] The KISS baseline was stated before any abstraction decision
- [ ] The speculative third subclass was explicitly deferred (YAGNI), not built
- [ ] The SRP violation was named by smell ("parses AND saves AND emails"), not by checklist
- [ ] Composition was preferred over extending the class hierarchy
- [ ] Dead/speculative abstraction was removed or the change left smaller
- [ ] Verification checklist ticked with no rationalization ("we might need it")