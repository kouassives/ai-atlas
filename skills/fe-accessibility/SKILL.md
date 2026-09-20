---
name: fe-accessibility
description: "Builds accessible UI to WCAG 2.1 AA: semantics, keyboard navigation, ARIA, focus management, and contrast. Use when building or reviewing UI, when interactive components work with a mouse only, or when a screen-reader user cannot complete the task."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: frontend
  sdlc-stage: implementation
  version: 1.0.0
---

# Accessibility (WCAG 2.1 AA)

## Overview

Accessibility is not a feature; it is the property of UI that works for everyone — keyboard-only users, screen-reader users, low-vision users, motor-impaired users — which is a superset of the users you were designing for. The WCAG 2.1 AA baseline covers the mechanics: perceivable (contrast, text alternatives), operable (keyboard, focus, timing), understandable (labels, errors, predictable behavior), and robust (semantics, ARIA done right — which is to say, sparingly).

## When to Use

- Building or reviewing any interactive UI (components, forms, modals, navigation).
- Mouse-only components (a clickable div with no keyboard path).
- Forms without labels, or color-only status signals.
- Anything new that renders content or takes input.

**When NOT to use:**

- Writing the automated check tooling (that is testing/CI — this skill sets what to assert).

## Process

### Step 1 — Semantics before ARIA

- Use native elements first: `<button>` for buttons, `<a href>` for links, `<input>/<label>` for fields, `<nav>`, `<main>`, `<table>` for tabular data. Native semantics bring keyboard behavior, roles, and screen-reader announcements for free.
- A `<div onclick>` is not a button; a `<span>` styled as a heading is not a heading. Reaching for ARIA to fix a non-native element is the tax of skipping Step 1.
- **ARIA is a contract**: the moment you add `role`, you own the behavior the role promises. Role added without behavior implemented = worse than nothing. Prefer fixing semantics over adding roles.

### Step 2 — Keyboard operability end to end

- Every interactive element is reachable AND operable by keyboard: Tab order follows the visual/logical order (no tabindex="1..n" hacks), Enter/Space activate buttons, arrows move within composites (tabs, lists, menus).
- **Focus is visible** (a 3:1-visible focus indicator) and **focus is managed**: modals trap and restore focus; expanding a menu moves/provides focus; route changes move focus to the new heading.
- No keyboard traps: a user can always Tab out of anything except an active modal (which needs an explicit close path).

### Step 3 — Provide text alternatives and labels

- Images/icon-only buttons have `alt`/aria-label that says what the element DOES (a magnifier "Search"), not what it looks like.
- Form fields have associated `<label>` (clickable, announced); errors are announced (`aria-describedby`, role="alert" for live errors) and tied to the field.
- Content conveyed by color alone (status dots, required asterisks) repeats the information in text.

### Step 4 — Meet and verify the contrast and target-size baseline

- Text contrast ≥ 4.5:1 (AA); large text ≥ 3:1; UI component/state boundaries ≥ 3:1. Check interactive states (hover, focus, disabled — disabled must still be legible).
- Touch/click targets ≥ 24×24 CSS px (per WCAG 2.2 target-size guidance; 44×44 recommended) with sufficient spacing.
- No content that only appears on hover that a keyboard user can never reach.

### Step 5 — Test with the real tools, automated + manual

- Automated: axe/core checks in CI (contrast, missing labels, ARIA misuse, alt text, landmark use) — the cheap net that catches the 40%.
- Manual passes that automation cannot: keyboard-only walkthrough of every critical journey (Tab everything, complete the flow), screen-reader pass on the critical flows, and zoom-to-200% + reduced-motion review.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The users are all developers/mice" | That is not a user model, it is an assumption that already excludes someone. |
| "ARIA everywhere = accessible" | Misused ARIA is worse than none; native semantics first, always. |
| "We'll do accessibility after launch" | Retrofitting a11y costs 10× the built-in version and ships the exclusion in the meantime. |
| "The screen reader is niche" | 8%+ of users have a disability; keyboard-only is far from niche. |
| "Automated checks pass, we're done" | Automation sees 40%; the keyboard and SR walkthroughs see the rest. |

## Red Flags

- Clickable divs/spans; buttons as divs with onclick; links as buttons and vice versa
- ARIA roles aded to fix missing native behavior
- No focus management in modals; focus lost or trapped; invisible focus indicators
- Color-only status; labels missing; error text not associated with the field
- Contrast failures on text or interactive states
- No automated checks in CI; no manual walkthroughs ever

## Verification

- [ ] Native semantics used; ARIA added only where native cannot do the job — with the promised behavior implemented
- [ ] Keyboard end-to-end: reachable, operable, visible focus, managed in modals, no traps
- [ ] Labels/alt/errors complete and announced; no color-only information
- [ ] Contrast AA verified (text + states); target sizes adequate
- [ ] Automated checks in CI AND manual keyboard + screen-reader passes on critical journeys
- [ ] No rationalization-based deferrals; retrofits not accepted as "later"