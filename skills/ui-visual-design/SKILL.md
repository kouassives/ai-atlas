---
name: ui-visual-design
description: "Produces deliberate visual design: typography, color, spacing, hierarchy, and composition. Use when producing visual design, when the UI looks random, or when styling decisions need a system instead of preferences."
license: MIT
compatibility: opencode, claude-code, codex
metadata:
  domain: ui-designer
  sdlc-stage: design
  version: 1.0.0
---

# Visual Design

## Overview

Visual design is the discipline of **deliberate** choices: every spacing, size, color, and typeface exists because it encodes something (importance, relationship, mood) — not because it was convenient. The levers here are **typography** (type system, scale, measure, legibility), **color** (roles, not preferences; contrast as a requirement), **spacing** (a scale, used consistently), **hierarchy** (what the eye meets first and why), and **composition** (alignment, grouping, rhythm, white space). This skill sets the system that `ui-design-systems` then codifies into tokens.

## When to Use

- Producing visual design for screens (new or redesigned).
- The UI "looks random": sizes, colors, spacings chosen ad hoc.
- The design exists as prototypes that must become a coherent visual language.
- Reviewing visual output for internal consistency.

**When NOT to use:**

- Accessibility compliance specifics (that is `fe-accessibility` — this skill respects it as a constraint).
- Codifying the language into tokens/libraries (`ui-design-systems`).

## Process

### Step 1 — Set a type system, not font choices

- Define a type scale (a small set of sizes with a clear ratio — not a size per use) and roles: display, heading, body, caption, label. Pick 1–2 families with a reason (readability at size, rendering cost, licensing — `fe-performance` font loading).
- Body measure (line length) stays in the readable range (~45–75 characters); line-height tuned per role.
- Hierarchy by WEIGHT and SIZE before color — a heading is a heading in grayscale, or the hierarchy is decoration.

### Step 2 — Color by role, with contrast as a requirement

- Color roles, not free palette: background, surface, text (primary/secondary/disabled), accent, success/warning/danger. Assign roles so swapping a palette does not mean re-deciding every screen.
- Every text/UI color passes the `fe-accessibility` AA contrast baseline (4.5:1 text, 3:1 UI) — visual design does not get to opt out.
- One accent, used sparingly: if everything is emphasized, hierarchy is flat. Never communicate by color alone.

### Step 3 — Space with a scale

- A spacing scale (base unit × step, e.g., 4/8/12/16/24/32/48) used by rule, not by feel — spacing that "looks right" differs per screen and creates the anecdote-layout look.
- Grouping is the visual encoding of relationships: related elements closer, unrelated separated (`ui-ux-flows` IA becomes spatial grouping here).

### Step 4 — Compose deliberately

- Alignment: pick edges and stick to them; centered-everything is where design goes to look un-designed.
- Rhythm: repeat spacing/margins so screens feel like one family; white space is a tool (rest) not a bug (waste).
- Establish the visual weight of the primary action on each screen and let composition make it findable without blinking.

### Step 5 — Verify the system before it becomes tokens

- Review the screens in grayscale: if hierarchy and grouping survive, the structure is sound and color was garnish.
- Check the responsive/state story: the type scale and spacing hold across viewports (`fe-responsive-design`), states (hover/focus/error) are defined visually, and the small viewport never gets micro-sized type.
- Hand off: the verified system is what `ui-design-systems` turns into design tokens; inconsistencies found here cost pennies, in the library they cost weeks.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Design is taste; we'll tune it in review" | Taste without a system is a review loop that never converges. |
| "We'll use this nice color, it fits the brand" | Color that fails contrast is a brand that excludes users. |
| "Spacing can be eyeballed" | Eyeballed spacing is how every screen invents its own scale. |
| "Make everything pop" | Everything popping is nothing popping; hierarchy IS priority. |
| "We'll fix hierarchy with color later" | If the hierarchy needs color to exist, it does not exist. |

## Red Flags

- A type size for every occasion; no scale or roles
- Free palette with no role system; text colors failing contrast
- Ad-hoc spacing (no unit-based scale); grouped unrelated content
- Misaligned compositions; rhythm breaks between screens
- Hierarchy invisible in grayscale
- No state design (hover/focus/error) and no small-viewport check

## Verification

- [ ] Type system defined (scale + roles, 1–2 families with reasons)
- [ ] Color by role; AA contrast checked for text and UI colors; single accent
- [ ] Spacing from a scale; grouping encodes relationships
- [ ] Composition deliberate: consistent alignment, rhythm, primary-action weight
- [ ] Grayscale review passes (hierarchy/grouping survive without color)
- [ ] Responsive + state behavior designed; handed to tokens without known inconsistencies