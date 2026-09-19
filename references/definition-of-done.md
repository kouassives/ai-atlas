# Definition of Done

> Documentation-only. Skills must NOT reference this file (self-containment).
> Agents and onboarding use it as the shared bar for "done".

Every change is a candidate for "done" only when ALL that applies to it passes:

## 1. Behavior

- [ ] The change does what the task stated — verified by running it, not by reading it
- [ ] Edge cases named in requirements are handled explicitly (and tested)
- [ ] Errors are surfaced to the caller with the API/UX contract of the system (status, message, channel)
- [ ] No behavior change outside the stated scope (no scope creep)

## 2. Tests

- [ ] A test exists that would fail without this change (red before green)
- [ ] Realistic cases at the right tier: unit for logic, integration for seams, e2e only for smoke
- [ ] The full relevant test suite runs green locally
- [ ] No skipped/silenced tests added

## 3. Software quality

- [ ] Code is shaped by the SOLID smell checks (`be-solid-principles`) where OO applies
- [ ] No duplication left that a named abstraction should remove; no abstraction forced that duplication does not justify (YAGNI)
- [ ] The change is reviewable: one concern per commit, reviewable diff size

## 4. Security

- [ ] Trust boundary drawn; all external input validated at the boundary (`fnd-security-basics`)
- [ ] AuthN + AuthZ (action AND resource) applied where the system has principals
- [ ] No secrets committed, no tokens in logs/URLs, secrets injected via config
- [ ] New dependencies pinned, audited, changelog reviewed

## 5. Documentation

- [ ] README/changelog updated if the change is user-facing (install, usage, API)
- [ ] ADR written for significant structural decisions (see `fnd-adr`)
- [ ] Documentation that the code contradicts was fixed IN THIS CHANGE (no drift)

## 6. X-Cutting

- [ ] Performance: no regression on the touched path without a profile explaining it (`be-performance`)
- [ ] Observability: failures and key paths are loggable with a correlation id where applicable
- [ ] CI green, including lint and the routing evals

**Intent > checklist**: an item that says N/A must say WHY. An item that could apply but is skipped is a blocker, not a shortcut.