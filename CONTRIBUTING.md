# Contributing

Thanks for helping build a solid, honest skills collection. The bar is high on purpose — skills are executed instructions, and bad skills are worse than no skills.

## What we accept

- **New skills** matching the taxonomy in [ARCHITECTURE.md](ARCHITECTURE.md) §2 (or a justified evolution of it).
- **Routing prompts** (`evals/routing/prompts.json`) — helps every skill's trigger vocabulary.
- **Eval cases** (`evals/cases/`) and lint improvements.
- **Fixups** to existing skills (accuracy, clarity, portability).

## What we do NOT accept

- Kitchen-sink skills ("…and also") — split them.
- Skills with cross-skill or cross-repo links (self-containment rule).
- Skills in the wrong domain prefix or with a colliding trigger vocabulary.
- Skills containing executable instructions that exfiltrate data, collect secrets, or pipe remote content to a shell (security lint blocks these).
- Stack-specific content masquerading as universal principles (the collection is language- and stack-agnostic).

## Process

1. **Fork + branch.** One skill = one PR (plus its routing prompt and eval case).
2. **Enable the git hook (once per clone).** The repo ships a versioned
   pre-commit hook that runs the CI gates and regenerates the derived files,
   so a stale `SKILLS.md` / `registry.yaml` / `site/` can never reach main:
   ```bash
   git config core.hooksPath .githooks
   ```
   It is deliberately not a [pre-commit.com](https://pre-commit.com) config:
   this repo is zero-dependency (Node stdlib + POSIX sh only — see
   [ARCHITECTURE.md](ARCHITECTURE.md) §"zero-dependency tooling").
3. **Verify locally** — the same gates CI runs:
   ```bash
   node scripts/lint-skills.mjs      # Tier 1 — structural
   node scripts/eval-routing.mjs     # Tier 2 — routing, no collisions
   node scripts/gen-index.mjs        # regenerate SKILLS.md (commit it)
   ```
   With the hook enabled, steps 2–3 happen automatically on commit.
4. **Write the eval case** (`evals/cases/<skill-name>.md`) and, for the release gate, run it once in a real OpenCode session.
5. **Open the PR.** CI runs the same commands. A reviewer must pass the security lint before merge.

## Review standards (applies to maintainers)

- Every skill PR gets a human review pass, going through the [author handbook](docs/writing-skills.md) checklist.
- A routing collision failure is a description problem, not an evals problem — fix descriptions, don't delete prompts.
- Security lint findings are **merge-blocking**.

## License

By contributing you agree your contributions are MIT-licensed (same as the repo).