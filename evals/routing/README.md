# Routing evals (Tier 2)

Deterministic, zero-LLM-cost checks run by `scripts/eval-routing.mjs` in CI.

## Schema — `prompts.json`

```json
[
  {
    "id": "be-01",
    "prompt": "A realistic message a user would actually type…",
    "expect": ["be-saga-pattern", "be-tdd"]
  }
]
```

- `id`: unique, `[domain]-NN`.
- `prompt`: verbatim-style user message. Write it the way a developer really asks, not the way the docs phrase it.
- `expect`: the skill(s) that MUST win routing for this prompt.

## Rules for contributors

1. **Every new skill must add ≥ 1 prompt** that targets it (orphan detection: a skill no prompt routes to is either dead or undescribed).
2. **Add prompts for the words users say**, not the words in the skill name.
3. A **collision failure** means two skills claim the same prompt — disambiguate the two `description` fields (front-load distinct triggers, add "NOT for…" phrasing), do not delete the prompt.

## Extension (phase 2, `expected.yaml`)

A human-readable `expected.yaml` mirror will be generated from this file by the release pipeline (`scripts/gen-index.mjs`). It is documentation, not a second source of truth.