# be-api-design — eval case

## Scenario
A team's API returns 200 with an `{error: "..."}` body on failures, has a `/getOrderData` endpoint, no pagination on the orders list, and order creation is retried blindly by clients with duplicate orders as a result. Prompt: "This API is causing support tickets. Fix the contract."

The agent must walk the API contract decisions: style check, resource/verb naming, status semantics, error contract, pagination, idempotency on mutations, versioning.

## Expected trace markers
- [ ] The agent loaded this skill when the scenario matched
- [ ] The 200-with-error-body pattern explicitly rejected (status semantics named)
- [ ] `/getOrderData` re-modeled as a noun-plural resource
- [ ] Error contract defined: stable code, message, field, request_id
- [ ] Pagination added with a cap and consistent cursor/paging
- [ ] Mutations given Idempotency-Key semantics (replay returns stored response)
- [ ] Versioning addressed for breaking contract changes
- [ ] No rationalization ("clients already handle the error body")