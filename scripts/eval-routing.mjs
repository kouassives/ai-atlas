#!/usr/bin/env node
/**
 * ai-engineer — Tier 2 routing evals
 *
 * Deterministic, zero-cost routing checks: verifies that each skill's
 * DESCRIPTION carries the vocabulary users actually type, that every
 * realistic prompt resolves to at least one skill, and that no two skills
 * collide on the same prompt (which would force a disambiguation).
 *
 * Zero dependencies (Node >= 18 stdlib only). Runs in CI on every PR.
 *
 * Prompts source of truth: evals/routing/prompts.json
 *   [{ "id": "fnd-01", "prompt": "…realistic user message…", "expect": ["fnd-x"] }]
 *
 * Usage:  node scripts/eval-routing.mjs [repo-root]
 * Exit:   0 = pass (notes allowed), 1 = routing failures found
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = process.argv[2] ?? join(HERE, "..");
const SKILLS_DIR = join(ROOT, "skills");
const PROMPTS_FILE = join(ROOT, "evals", "routing", "prompts.json");

const STOPWORDS = new Set(
  `a an and are as at be but by for from has have how in is it its of on or that the this to was we what when which who will with you your i me my our do does did not no yes can could should would please help want need build make create use using used code coding project app application feature change fix add implement
about above after again against all also any because before being below between both each few further here into just made more most much must off only other out own same some such than then there these they thing things through under up very where while why down onto over under until upon within without`
    .split(/\s+/)
);

function tokens(text) {
  return (text.toLowerCase().match(/[a-z0-9][a-z0-9-]{1,}/g) ?? []).filter((t) => !STOPWORDS.has(t));
}

function skillVocab(desc) {
  const counts = new Map();
  for (const t of tokens(desc)) counts.set(t, (counts.get(t) ?? 0) + 1);
  return counts;
}

function findSkillDirs(dir) {
  if (!existsSync(dir)) return [];
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (existsSync(join(full, "SKILL.md"))) found.push(full);
      found.push(...findSkillDirs(full));
    }
  }
  return found;
}

function readDescriptions() {
  const out = new Map();
  for (const dir of findSkillDirs(SKILLS_DIR)) {
    const md = readFileSync(join(dir, "SKILL.md"), "utf8");
    const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (!m) continue;
    const fm = {};
    for (const line of m[1].split(/\r?\n/)) {
      const idx = line.indexOf(":");
      if (idx <= 0) continue;
      fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    }
    if (fm.name && fm.description) out.set(fm.name, { desc: fm.description, vocab: skillVocab(fm.description) });
  }
  return out;
}

/* ------------------------------------------------------------------ */

const skills = readDescriptions();
console.log(`ai-engineer routing evals — skills with descriptions: ${skills.size}`);

if (!existsSync(PROMPTS_FILE)) {
  console.log("  … evals/routing/prompts.json missing — nothing to evaluate");
  process.exit(0);
}

const prompts = JSON.parse(readFileSync(PROMPTS_FILE, "utf8"));
if (!Array.isArray(prompts) || prompts.length === 0) {
  console.log("  … no routing prompts defined yet — nothing to evaluate");
  process.exit(0);
}

const failures = [];
const notes = [];

for (const p of prompts) {
  const promptTokens = tokens(p.prompt);
  const scores = [];
  for (const [name, skill] of skills) {
    let hits = 0;
    for (const t of promptTokens) if (skill.vocab.has(t)) hits++;
    scores.push({ name, hits });
  }
  scores.sort((a, b) => b.hits - a.hits || a.name.localeCompare(b.name));

  const expected = p.expect ?? [];
  if (expected.length === 0) {
    notes.push(`  ℹ ${p.id}: no "expect" defined — cannot verify`);
    continue;
  }

  // Orphan check: referenced skill must exist — but only a NOTE: skills land in
  // later lots, and pending prompts must not break CI before their skill exists.
  const missing = expected.filter((name) => !skills.has(name));
  if (missing.length > 0 && !skills.has(p.expect[0])) {
    notes.push(`  ℹ ${p.id}: expected skill(s) not implemented yet (${missing.join(", ")}) — skipped`);
    continue;
  }

  const byName = Object.fromEntries(scores.map((s) => [s.name, s.hits]));
  const expectedHits = Math.max(...expected.map((n) => byName[n] ?? 0));

  if (expectedHits === 0) {
    failures.push(`  ✖ ${p.id}: prompt matched NO expected skill — description vocabulary gap\n      prompt: "${p.prompt.slice(0, 120)}"`);
    continue;
  }

  // Collision check: any non-expected skill scoring >= the expected winner?
  const topNonExpected = scores.filter((s) => !expected.includes(s.name) && s.hits >= expectedHits);
  for (const c of topNonExpected) {
    failures.push(
      `  ✖ ${p.id}: routing collision — "${c.name}" (hits ${c.hits}) competes with expected ${expected.join(", ")} (hits ${expectedHits})\n      prompt: "${p.prompt.slice(0, 120)}" → disambiguate the descriptions`
    );
  }
}

const top3 = (scores) => scores.slice(0, 3).map((s) => `${s.name}:${s.hits}`).join(", ");
for (const p of prompts) {
  const promptTokens = tokens(p.prompt);
  const scores = [];
  for (const [name, skill] of skills) {
    let hits = 0;
    for (const t of promptTokens) if (skill.vocab.has(t)) hits++;
    scores.push({ name, hits });
  }
  scores.sort((a, b) => b.hits - a.hits);
  if (scores.length > 0) notes.push(`  ℹ ${p.id}: top matches → ${top3(scores)}`);
}

for (const n of notes) console.log(n);
for (const f of failures) console.log(f);
console.log(failures.length === 0 ? "✅ PASS" : `❌ FAIL (${failures.length} routing issues)`);
process.exit(failures.length === 0 ? 0 : 1);