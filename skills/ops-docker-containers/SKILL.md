---
name: ops-docker-containers
description: "Containerizes applications well: multi-stage builds, minimal images, layer caching, security scanning, and non-root runtime. Use when writing or reviewing a Dockerfile, when images are huge or leak secrets, when builds are slow, or when containers run as root or with unnecessary tools."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: devops
  sdlc-stage: build
  version: 1.0.0
---

# Docker Containers

## Overview

A container image is a deploy artifact AND an attack surface: every layer you add is something that must be maintained and could be exploited. Good containerization is minimal, reproducible, cache-friendly, and runs with the least privilege. This skill covers multi-stage builds, image minimization, cache-keying for speed, scanning, and the non-root runtime rule.

## When to Use

- Writing or reviewing a Dockerfile (or container image definition).
- Images are huge, contain build tools/credentials, or rebuild too slowly.
- Containers run as root or as a user with unnecessary privileges.
- Adding or bumping a base image or system dependency.

**When NOT to use:**

- Kubernetes deployment specifics (probes, resources) — that is `ops-kubernetes`; image scanning gates in pipelines — `ops-devsecops`.

## Process

### Step 1 — Start from a trusted, minimal base

- Official/pinned images only (digest-pinned where stability matters), latest tags banned in favor of explicit versions.
- Distroless/Alpine-class images when the runtime allows; no OS package manager in the final image unless a runtime dependency insists.
- Read the changelog of the base image like a dependency (`be-security-engineering` Step 5) — base image = dependency.

### Step 2 — Multi-stage: build in one stage, ship in another

```dockerfile
# stage 1: build
FROM <toolchain> AS build
COPY . .
RUN build
# stage 2: runtime
FROM <distroless/minimal>
COPY --from=build /app/bin /app/bin
USER nonroot
```

The final image contains only the runtime and the artifact — no toolchain, no compilers, no package index, no source that the artifact does not execute.

### Step 3 — Cache like the build is financial

- Order layers by volatility: dependencies (rarely change) BEFORE source (changes every commit). A source-first Dockerfile invalidates the whole cache each build.
- Cache invalidation keys are checksums of the inputs (lockfiles!), not timestamps.
- Build context stays small: `.dockerignore` (git, tests, node_modules, secrets) — context size is build time and secret-leak surface.

### Step 4 — Never leak secrets into layers

- No secrets in build args that land in the image: `ARG`/`ENV` values are baked into layers and inspectable. Use build secrets mounts or multi-stage `COPY --from` passing.
- After build or before push, scan the image (`ops-devsecops`): vulns, secret detection, and metadata review.
- Layers with credentials, even "removed later", are recoverable from history — removal in a later layer is not removal.

### Step 5 — Run as non-root, read-only where possible

- `USER <nonroot>` with a dedicated uid; capability sets trimmed (`--cap-drop=ALL` for most containers).
- Filesystem read-only at runtime unless the app writes; secrets via mounts/env injection, not baked layers.
- Health-check which does not require root (avoid curl-in-image; probe the app's own signal).

### Step 6 — Verify the artifact, not the hope

- `docker scan` / CI gate on critical/high with a triage path (`ops-devsecops`).
- Size budget: an image addition must justify its megabytes; the diff review of an image is a real review.
- Run the image once from a clean daemon and execute the healthcheck path — the "works on my host" lie lives at the boundary.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Alpine doesn't have the lib, use ubuntu" | Adding a distro is a maintenance and surface decision — justify it, don't default to it. |
| "We need bash for debugging in prod" | Prod containers are deploy artifacts, not debug hosts; shell = attack surface. |
| "The secret in ARG is used only at build time" | ARG values persist in image history; any image consumer can read them. |
| "Non-root breaks our scripts" | Then the fix is the scripts, not the privilege. |
| "Images are big, whatever, disk is cheap" | Size is also pull latency, cold-start time, and vulnerability surface. |

## Red Flags

- Root user in runtime, bash-heavy images, package managers in final stage
- Secrets in ENV/ARG/COPY layers (even "removed later")
- Source copied before dependencies (cache thrash)
- Unpinned `latest` base images
- No `.dockerignore`, huge build context
- No scan, no size review on new images

## Verification

- [ ] Base image pinned and trusted; minimal for the runtime
- [ ] Multi-stage: final image ships artifact only (no toolchain/package index)
- [ ] Layers ordered deps-then-source; cache keys are lockfile checksums; dockerignore present
- [ ] No secrets in layers; build secrets used for anything sensitive
- [ ] Non-root runtime, trimmed capabilities, read-only fs where possible
- [ ] Image scanned; critical/high triaged; size addition justified