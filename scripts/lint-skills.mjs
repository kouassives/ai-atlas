#!/usr/bin/env node
/**
 * ai-atlas — Tier 1 structural lint
 *
 * Verifies every skill in `skills/` and every agent in `agents/` against the
 * collection conventions defined in ARCHITECTURE.md §3 / §4.
 *
 * Zero dependencies (Node >= 18 stdlib only). Runs in CI on every PR.
 *
 * Usage:  node scripts/lint-skills.mjs [repo-root]
 * Exit:   0 = clean (warnings allowed), 1 = errors found
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, basename, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = process.argv[2] ?? join(HERE, "..");
const SKILLS_DIR = join(ROOT, "skills");
const AGENTS_DIR = join(ROOT, "agents");

const results = { errors: [], warnings: [] };
const err = (msg) => results.errors.push(msg);
const warn = (msg) => results.warnings.push(msg);

/* ------------------------------------------------------------------ */
/* Frontmatter utilities                                               */
/* ------------------------------------------------------------------ */

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return null;
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    value = value.replace(/^["']|["']$/g, "").trim();
    fields[key] = value;
  }
  return fields;
}

/** Find all directories (arbitrary depth) that contain a SKILL.md. */
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

/** Collect section headings (## ...) as lowercase strings. */
function headings(md) {
  return [...md.matchAll(/^#{2,3}\s+(.*)$/gm)].map((m) => m[1].toLowerCase());
}

/** Check for forbidden escape links: ../ or absolute paths in markdown links. */
function checkLinks(md, dirPath, label) {
  const linkRe = /!?\[[^\]]*\]\(([^)]+)\)/g;
  let m;
  while ((m = linkRe.exec(md)) !== null) {
    const target = m[1].trim();
    if (target.startsWith("../") || target.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(target)) {
      err(`[${label}] link escapes the skill folder (self-containment violation): ${target}`);
    }
  }
}

const SECURITY_PATTERNS = [
  { re: /\bcurl\b[^\n|]*\|\s*(sh|bash)\b/i, label: "pipe remote content to a shell" },
  { re: /\bwget\b[^\n|]*\|\s*(sh|bash)\b/i, label: "pipe remote content to a shell" },
  { re: /\bexfiltrat/i, label: "exfiltration instruction" },
  { re: /\bsteal\b[\s\S]{0,40}\b(secret|token|password|credential|api[_ -]?key)\b/i, label: "credential-stealing instruction" },
  { re: /\bsend\b[\s\S]{0,50}\b(secret|token|password|credential|api[_ -]?key)\b[\s\S]{0,30}\b(attacker|remote|third|\bhack\w*)\b/i, label: "credential exfiltration instruction" },
];

function checkSecurity(md, label) {
  for (const { re, label: what } of SECURITY_PATTERNS) {
    if (re.test(md)) err(`[${label}] security lint: ${what} pattern detected`);
  }
}

const REQUIRED_SECTIONS = [
  "overview",
  "when to use",
  "process",
  "common rationalizations",
  "red flags",
  "verification",
];

const ALLOWED_EXTENSIONS = new Set([".md"]);
const ALLOWED_SUBDIRS = new Set(["references", "assets"]);

function lintSkill(dir) {
  const name = basename(dir);
  const rel = relative(ROOT, dir);
  const label = `skill:${name}`;
  const mdPath = join(dir, "SKILL.md");
  const md = readFileSync(mdPath, "utf8");

  /* --- folder contents --- */
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !ALLOWED_SUBDIRS.has(entry.name)) {
      err(`[${label}] unexpected subdirectory "${entry.name}" (only references/ and assets/ allowed)`);
      continue;
    }
    if (entry.isFile() && entry.name !== "SKILL.md" && extname(entry.name) !== ".md") {
      err(`[${label}] unexpected file "${entry.name}" (self-containment: markdown or SKILL.md only)`);
    }
  }

  /* --- frontmatter --- */
  const fm = parseFrontmatter(md);
  if (!fm) {
    err(`[${label}] missing YAML frontmatter`);
    return;
  }
  if (!fm.name) err(`[${label}] frontmatter "name" is required`);
  else {
    if (fm.name !== name) err(`[${label}] frontmatter name "${fm.name}" != folder name "${name}"`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name)) err(`[${label}] name must be lowercase-hyphen: "${fm.name}"`);
    if (fm.name.length > 64) err(`[${label}] name exceeds 64 chars (${fm.name.length})`);
    if (!/^(fnd|arch|be|fe|ui|tst|ops)-/.test(fm.name)) warn(`[${label}] name has no domain prefix (fnd-/arch-/be-/fe-/ui-/tst-/ops-)`);
  }
  if (!fm.description) err(`[${label}] frontmatter "description" is required`);
  else if (fm.description.length <= 20) err(`[${label}] description too short (${fm.description.length} chars) — needs trigger vocabulary`);
  if (fm.metadata?.domain && !/^(foundation|architect|developer-backend|developer-frontend|ui-designer|tester|devops)$/.test(fm.metadata.domain)) {
    err(`[${label}] metadata.domain not in known set: "${fm.metadata.domain}"`);
  }

  /* --- required sections --- */
  const hs = headings(md);
  for (const section of REQUIRED_SECTIONS) {
    if (!hs.some((h) => h === section)) err(`[${label}] missing required section "## ${section}"`);
  }
  if (!/when not to use/i.test(md)) warn(`[${label}] missing explicit "When NOT to use" block (anti-trigger discipline)`);

  /* --- self-containment & security --- */
  checkLinks(md, dir, label);
  checkSecurity(md, label);

  /* --- length budget --- */
  const lines = md.split(/\r?\n/).length;
  if (lines > 250) err(`[${label}] SKILL.md too long: ${lines} lines (> 250)`);
  else if (lines > 200) warn(`[${label}] SKILL.md at ${lines} lines — target ≤ 200; move depth to references/`);

  /* --- references/ depth check (markdown only) --- */
  const refDir = join(dir, "references");
  if (existsSync(refDir)) {
    const walk = (d) =>
      readdirSync(d, { withFileTypes: true }).forEach((e) => {
        const f = join(d, e.name);
        if (e.isDirectory()) walk(f);
        else if (!ALLOWED_EXTENSIONS.has(extname(e.name))) err(`[${label}] reference file must be .md: ${e.name}`);
      });
    walk(refDir);
  }
}

function lintAgent(file) {
  const name = basename(file, ".md");
  const label = `agent:${name}`;
  const md = readFileSync(file, "utf8");
  const fm = parseFrontmatter(md);
  if (!fm) return err(`[${label}] missing YAML frontmatter`);
  if (!fm.description) err(`[${label}] frontmatter "description" is required`);
  if (!fm.mode) err(`[${label}] frontmatter "mode" is required`);
  else if (!["primary", "subagent", "all"].includes(fm.mode)) err(`[${label}] mode must be primary|subagent|all, got "${fm.mode}"`);
  if (fm.model) warn(`[${label}] "model" is set in frontmatter — we deliberately leave it to the user's default`);
}

/* ------------------------------------------------------------------ */

const skillDirs = findSkillDirs(SKILLS_DIR).sort();
for (const dir of skillDirs) lintSkill(dir);

const agentFiles = existsSync(AGENTS_DIR)
  ? readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".md")).map((f) => join(AGENTS_DIR, f))
  : [];
for (const f of agentFiles) lintAgent(f);

/* --- report --- */
console.log(`ai-atlas lint — skills: ${skillDirs.length}, agents: ${agentFiles.length}`);
for (const w of results.warnings) console.log(`  ⚠ ${w}`);
for (const e of results.errors) console.log(`  ✖ ${e}`);
console.log(results.errors.length === 0 ? "✅ PASS" : `❌ FAIL (${results.errors.length} errors)`);
process.exit(results.errors.length === 0 ? 0 : 1);