---
name: fe-performance
description: "Keeps the frontend fast: Core Web Vitals, bundle analysis, rendering cost, memoization, and image optimization. Use when the UI feels slow, when budgets regress, when bundles bloat, or when interaction feels janky."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: frontend
  sdlc-stage: implementation
  version: 1.0.0
---

# Frontend Performance

## Overview

Frontend performance is user experience measured: how fast content appears, how fast it responds, and how much it costs to download. The evidence loop from `be-performance` applies — budget → baseline → profile → fix → verify — with the frontend's own metric set: **Core Web Vitals** for the user contract, **bundle size** for the download cost, and **rendering cost** for interaction smoothness.

## When to Use

- The UI feels slow, janky, or budgets regress.
- Bundle analysis shows bloat or a dependency is drag racing the first load.
- Lists/dashboards re-render wastefully; interactions stutter.
- A performance regression needs a root cause, not a guess.

**When NOT to use:**

- Server-side latency diagnosis (that is `be-performance`); validating load targets with test programs (`tst-performance-testing`).

## Process

### Step 1 — Budget and baseline the Web Vitals

- Set budgets per Core Web Vital: **LCP** (largest content, ≤ 2.5s), **INP** (interaction, ≤ 200ms), **CLS** (layout shift, ≤ 0.1) on a representative device/network (mid-range phone, throttled — not the dev-machine hero numbers).
- Baseline with real field data (RUM) where available + lab (Lighthouse) for the controlled number. No budget, no baseline = optimizations are decoration.

### Step 2 — Profile before optimizing (the loop works here too)

- Measure WHERE the time goes before touching anything: LCP breakdown (server response? render-blocking? image? font?), INP breakdown (long tasks? layout thrash?), bundle breakdown (who is big and why).
- Never "add memoization everywhere" because it feels right — memoization has a cost and its absence may not be the problem.

### Step 3 — Own the bundle

- Analyze (bundle analyzer/import graphs); the top offenders are usually one big dependency and a barrel importing everything.
- Cut: replace heavy deps, import-on-demand, code-split at route/feature boundaries (`fe-architecture` §4), drop dead exports. A dependency that costs bundle must earn its bytes (per `be-security-engineering` dependency hygiene, with a size lens).
- Track total JS shipped per route with a budget; bundle size is a CI checkable metric.

### Step 4 — Reduce rendering cost deliberately

- **Memoize by shape**: memoize components/hooks whose props change identity but not content (lists, derived data), not "everything" (over-optimization doubles bookkeeping).
- Virtualize long lists; paginate or window rather than rendering 10k rows.
- Avoid layout thrash: batch reads/writes, use transforms for animations (compositor-friendly), keep DOM breadth sane.
- Long tasks are the INP enemy: chunk heavy work, defer non-critical work, yield to the main thread (`fe-api-integration` background patterns support this).

### Step 5 — Optimize images and media (the LCP budget's biggest line)

- Modern formats (AVIF/WebP with fallbacks), `srcset/picture` with the right sizes per viewport, `loading="lazy"` for below-fold, `fetchpriority="high"` only for the real LCP element.
- Preload the LCP resource (hero image, key font) with `rel="preload"`; avoid preloading everything.
- **CLS**: reserve space (aspect-ratio, width/height) for images/ads/embeds — layout shift is a styling bug with a metric.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The dev machine is fast" | The user's phone is not your machine; budget on the representative device. |
| "Memoize everything, it's free" | Memoization has bookkeeping cost and hides the real render culprit. |
| "One more JS library is fine" | One more library is one more slice of every user's first-load budget. |
| "Images load fine" | Images are usually the LCP and the bandwidth bill; measure their slice. |
| "We'll optimize when it's slow" | Slow is shipped first — the users you have evidence about, after the fact. |

## Red Flags

- No Web Vitals budget or baseline; optimizing without measurement
- Unanalyzed bundle; barrel imports; heavy dep with no byte-earned justification
- Memoization blanket-applied; unvirtualized huge lists
- Layout thrash under animation; no space reserved (CLS)
- Unoptimized hero images; no preload on the LCP element
- "Fast in devtools" as the only evidence

## Verification

- [ ] Web Vitals budgets set; lab + field baseline taken on representative device
- [ ] Profile identified the dominant cost; optimization targeted at it
- [ ] Bundle owned: analyzer run, heavy deps justified, route-level splitting, size budget in CI
- [ ] Memoization/rendering tuned to shape; lists virtualized; long tasks yielded
- [ ] Images/media: formats, srcset, lazy/fetchpriority correct; LCP preloaded; CLS space-reserved
- [ ] Before/after verified on the SAME metrics and device profile