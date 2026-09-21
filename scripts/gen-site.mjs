#!/usr/bin/env node
/**
 * ai-atlas — static site generator (GitHub Pages)
 *
 * Zero-dependency (Node >= 18 stdlib only). Reads the catalog from the
 * filesystem — the single source of truth — and emits a deterministic
 * static site into `site/`:
 *
 *   site/index.html            landing page (from README.md)
 *   site/skills.html           all skills, grouped by domain, client-filtered
 *   site/skill/<id>.html       per-skill detail pages
 *   site/agents.html           all agents
 *   site/agent/<id>.html       per-agent detail pages
 *   site/install.html          per-tool install instructions (docs/usage.md)
 *   site/docs/<id>.html        rendered docs/*.md pages
 *   site/assets/site.css       stylesheet
 *   site/assets/site.js        client-side filter
 *
 * Deterministic: sorted iteration, no timestamps — CI enforces freshness
 * with `git diff --exit-code site/` (same pattern as SKILLS.md / registry).
 *
 * Usage:
 *   node scripts/gen-site.mjs          generate site/
 *   node scripts/gen-site.mjs --check  generate, then verify every internal
 *                                      href/src resolves to an emitted file
 *                                      (exit 1 on any broken link)
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync, statSync } from "node:fs";
import { join, dirname, basename, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : join(HERE, "..");
const CHECK = process.argv.includes("--check");
const OUT = join(ROOT, "site");

const DOMAIN_LABELS = {
  "fnd-": "Foundation",
  "arch-": "Architect",
  "be-": "Developer Backend",
  "fe-": "Developer Frontend",
  "ui-": "UI Designer",
  "tst-": "Tester",
  "ops-": "DevOps",
};
const DOMAIN_ORDER = ["fnd-", "arch-", "be-", "fe-", "ui-", "tst-", "ops-"];

/* ------------------------------------------------------------------ */
/* Frontmatter + discovery                                             */
/* ------------------------------------------------------------------ */

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return {};
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim().replace(/^["']|["']$/g, "");
    let value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (key === "metadata") {
      /* placeholder — parsed below */
    }
    fields[key] = value;
  }
  const metaMatch = m[1].match(/^metadata:\s*$/m);
  if (metaMatch) {
    const blockLines = m[1].split(/\r?\n/);
    const start = blockLines.findIndex((l) => l.trim() === "metadata:");
    fields.metadata = {};
    for (let i = start + 1; i < blockLines.length; i++) {
      const line = blockLines[i];
      if (!line || !line.startsWith("  ")) break;
      const idx = line.indexOf(":");
      if (idx < 0) continue;
      fields.metadata[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
  return fields;
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

/** Split frontmatter from body; returns { fm, body }. */
function splitDoc(text) {
  const m = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (!m) return { fm: {}, body: text };
  return { fm: parseFrontmatter(text), body: text.slice(m[0].length) };
}

const skillDirs = findSkillDirs(join(ROOT, "skills")).sort();
const skills = skillDirs.map((dir) => {
  const raw = readFileSync(join(dir, "SKILL.md"), "utf8");
  const { fm, body } = splitDoc(raw);
  return { id: fm.name || basename(dir), fm, body };
});

const agentFiles = existsSync(join(ROOT, "agents"))
  ? readdirSync(join(ROOT, "agents")).filter((f) => f.endsWith(".md")).sort()
  : [];
const agents = agentFiles.map((f) => {
  const raw = readFileSync(join(ROOT, "agents", f), "utf8");
  const { fm, body } = splitDoc(raw);
  return { id: basename(f, ".md"), fm, body };
});

const docFiles = existsSync(join(ROOT, "docs"))
  ? readdirSync(join(ROOT, "docs")).filter((f) => f.endsWith(".md")).sort()
  : [];
const docs = docFiles.map((f) => {
  const raw = readFileSync(join(ROOT, "docs", f), "utf8");
  const { fm, body } = splitDoc(raw);
  const title = (body.match(/^#\s+(.+)$/m) || [])[1] || basename(f, ".md");
  return { id: basename(f, ".md"), fm, title, body };
});

const readme = existsSync(join(ROOT, "README.md")) ? readFileSync(join(ROOT, "README.md"), "utf8") : "";

/* ------------------------------------------------------------------ */
/* Minimal markdown renderer (subset sufficient for this corpus)       */
/* ------------------------------------------------------------------ */

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Rewrite repo-relative md links to site paths. */
function rewriteHref(href) {
  if (!href || href.startsWith("#") || /^(https?:|mailto:|data:)/.test(href)) return href;
  if (href === "README.md") return "index.html";
  if (href === "SKILLS.md") return "skills.html";
  if (href === "docs/usage.md") return "install.html";
  const mDoc = href.match(/^docs\/(.+)\.md$/);
  if (mDoc) return `docs/${mDoc[1]}.html`;
  const mSkill = href.match(/^skills\/([^/]+)\/SKILL\.md$/);
  if (mSkill) return `skill/${mSkill[1]}.html`;
  const mAgent = href.match(/^agents\/(.+)\.md$/);
  if (mAgent) return `agent/${mAgent[1]}.html`;
  // known repo-root files without an extension
  if (["LICENSE", "CONTRIBUTING.md", "ARCHITECTURE.md", "install.sh", "opencode.json"].includes(href)) {
    return `https://github.com/kouassives/ai-atlas/blob/main/${href}`;
  }
  // unknown repo-relative file: point at the GitHub blob (raw content lives there)
  if (/\.(md|yaml|sh|json|mjs|yml)$/.test(href)) return `https://github.com/kouassives/ai-atlas/blob/main/${href}`;
  return href;
}

function inline(s) {
  return s
    .replace(/`([^`]+)`/g, (_, c) => `<code>${esc(c)}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => `<a href="${rewriteHref(href)}">${label}</a>`);
}

function renderTable(rows) {
  let head = true;
  let out = "<table>";
  for (const row of rows) {
    const cells = row.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) {
      continue; // delimiter row (never rendered)
    }
    const tag = head ? "th" : "td";
    out += `<tr>${cells.map((c) => `<${tag}>${inline(c)}</${tag}>`).join("")}</tr>`;
    head = false;
  }
  return out + "</table>";
}

function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;
  let para = [];
  let listType = null;
  let listBuf = [];
  let blockquote = [];
  let tableBuf = [];

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (listBuf.length) out.push(`<${listType}>${listBuf.join("")}</${listType}>`);
    listBuf = [];
    listType = null;
  };
  const flushQuote = () => {
    if (blockquote.length) out.push(`<blockquote><p>${inline(blockquote.join(" "))}</p></blockquote>`);
    blockquote = [];
  };
  const flushTable = () => {
    if (tableBuf.length) out.push(renderTable(tableBuf));
    tableBuf = [];
  };

  const flush = () => {
    flushPara();
    flushList();
    flushQuote();
    flushTable();
  };

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    if (/^```/.test(line)) {
      flush();
      const lang = line.slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      out.push(`<pre><code${lang ? ` class="language-${esc(lang)}"` : ""}>${esc(buf.join("\n"))}</code></pre>`);
      i++;
      continue;
    }

    // table
    if (/^\s*\|.*\|\s*$/.test(line)) {
      flushPara();
      flushList();
      flushQuote();
      tableBuf.push(line);
      i++;
      continue;
    }

    // continuation line of an active list item (soft-wrapped item text)
    if (listType && /^\s+\S/.test(line)) {
      const last = listBuf.pop() ?? "";
      listBuf.push(`${last.replace(/<\/li>$/, "")} ${inline(line.trim())}</li>`);
      i++;
      continue;
    }

    // code-indented or empty
    if (line.trim() === "") {
      flush();
      i++;
      continue;
    }

    // headings
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flush();
      const level = Math.min(h[1].length + 1, 4); // h1 -> h2 inside page chrome
      out.push(`<h${level} id="${esc(h[2].toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"))}">${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      flush();
      blockquote.push(line.replace(/^>\s?/, ""));
      i++;
      continue;
    }

    // unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      flushPara();
      flushQuote();
      flushTable();
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      listBuf.push(`<li>${inline(line.replace(/^\s*[-*+]\s+/, ""))}</li>`);
      i++;
      continue;
    }

    // ordered list
    if (/^\s*\d+[.)]\s+/.test(line)) {
      flushPara();
      flushQuote();
      flushTable();
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      listBuf.push(`<li>${inline(line.replace(/^\s*\d+[.)]\s+/, ""))}</li>`);
      i++;
      continue;
    }

    // horizontal rule
    if (/^\s*---+\s*$/.test(line)) {
      flush();
      out.push("<hr>");
      i++;
      continue;
    }

    // paragraph continuation
    para.push(line);
    i++;
  }
  flush();
  return out.join("\n");
}

/* ------------------------------------------------------------------ */
/* Layout chrome                                                       */
/* ------------------------------------------------------------------ */

function nav(active) {
  const items = [
    ["index.html", "Home"],
    ["skills.html", "Skills"],
    ["agents.html", "Agents"],
    ["install.html", "Install"],
    ["docs/usage.html", "Docs"],
  ];
  return `<nav class="site-nav"><a class="brand" href="index.html">ai-atlas</a><ul>${items
    .map(([href, label]) => `<li><a href="${href}"${href === active ? ' class="active"' : ""}>${label}</a></li>`)
    .join("")}</ul></nav>`;
}

function page(active, title, contentHtml) {
  // pages in subdirectories (skill/, agent/, docs/) anchor relative URLs
  // against the site root with <base href="../">; root pages use "./".
  const depth = active.includes("/") ? "../" : "./";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base href="${depth}">
<title>${esc(title)} · ai-atlas</title>
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
<header>${nav(active)}</header>
<main class="content">
${contentHtml}
</main>
<footer class="site-footer">
  <p>ai-atlas — MIT licensed. <a href="https://github.com/kouassives/ai-atlas">Source on GitHub</a>.</p>
</footer>
<script src="assets/site.js"></script>
</body>
</html>
`;
}

function escapeId(id) {
  return id.replace(/[^\w-]/g, "");
}

/* ------------------------------------------------------------------ */
/* Page builders                                                        */
/* ------------------------------------------------------------------ */

function landingPage() {
  const domainCounts = DOMAIN_ORDER.map((p) => [DOMAIN_LABELS[p], skills.filter((s) => s.id.startsWith(p)).length]).filter(([, n]) => n > 0);
  const stats = `
  <section class="hero">
    <h1>ai-atlas</h1>
    <p class="tagline">Production-grade skills and agents for AI coding assistants — covering the full software development lifecycle, organized by SDLC role.</p>
    <div class="stats">
      <div class="stat"><strong>${skills.length}</strong><span>skills</span></div>
      <div class="stat"><strong>${agents.length}</strong><span>agents</span></div>
      <div class="stat"><strong>${docs.length}</strong><span>docs</span></div>
    </div>
  </section>
  <section class="domains">
    <h2>Domains</h2>
    <ul class="domain-grid">
    ${domainCounts.map(([label, n]) => `<li><a href="skills.html">${esc(label)}</a><span>${n} skills</span></li>`).join("")}
    </ul>
  </section>
  <section class="sdd-panel">
    <p class="kicker">Spec-Driven Development</p>
    <h2>Every change starts as a proposal — driven by the Openspec workflow</h2>
    <p>The <a href="agent/orchestration-engineer.html"><code>orchestration-engineer</code></a> agent loads the Openspec skills installed by the <code>@fission-ai/openspec</code> CLI (<code>openspec-explore</code>, <code>openspec-propose</code>, <code>openspec-apply-change</code>, <code>openspec-archive-change</code>) and follows their workflow as the source of truth. It then delegates technical work to the specialist agents under handoff contracts. See <a href="docs/spec-driven-development.html">what ai-atlas adds around Openspec</a> — it never redefines it.</p>
  </section>`;
  const body = readme.replace(/^#\s+.*\n/m, ""); // drop the README h1 (hero has it)
  const content = `${stats}\n<section class="readme">${mdToHtml(body)}</section>`;
  return page("index.html", "Home", content);
}

function skillsPage() {
  const groups = DOMAIN_ORDER.map((p) => [
    DOMAIN_LABELS[p],
    skills.filter((s) => s.id.startsWith(p)).sort((a, b) => a.id.localeCompare(b.id)),
  ]).filter(([, list]) => list.length > 0);

  const rows = groups
    .map(
      ([label, list]) => `
      <h2 class="domain" data-domain="${esc(label)}">${esc(label)} <span class="count">${list.length}</span></h2>
      <table class="skill-table">
        <thead><tr><th>Skill</th><th>Purpose</th></tr></thead>
        <tbody>
        ${list
          .map(
            (s) =>
              `<tr data-search="${esc((s.id + " " + (s.fm.description || "")).toLowerCase())}">
                 <td><a class="skill-id" href="skill/${escapeId(s.id)}.html"><code>${esc(s.id)}</code></a></td>
                 <td class="purpose">${esc((s.fm.description || "").split(/\.\s/)[0])}</td>
               </tr>`
          )
          .join("")}
        </tbody>
      </table>`
    )
    .join("");

  const content = `
    <section class="hero sub">
      <h1>Skills</h1>
      <p>${skills.length} self-contained, namespaced skills — install them side-by-side with any other collection without collisions.</p>
    </section>
    <section class="filter"><label for="skill-filter">Filter</label><input id="skill-filter" type="search" placeholder="filter by name or purpose…"></section>
    <div id="skill-groups">${rows}</div>`;
  return page("skills.html", "Skills", content);
}

function skillDetailPage(s) {
  const title = s.id;
  const meta = s.fm.metadata || {};
  const domain = s.id.startsWith("fnd-") ? "Foundation" : s.id.startsWith("arch-") ? "Architect" : s.id.startsWith("be-") ? "Developer Backend" : s.id.startsWith("fe-") ? "Developer Frontend" : s.id.startsWith("ui-") ? "UI Designer" : s.id.startsWith("tst-") ? "Tester" : s.id.startsWith("ops-") ? "DevOps" : "—";
  const badges = [
    meta.domain && `<span class="badge">${esc(meta.domain)}</span>`,
    meta["sdlc-stage"] && `<span class="badge">${esc(meta["sdlc-stage"])}</span>`,
    s.fm.compatibility && `<span class="badge">${esc(s.fm.compatibility)}</span>`,
    s.fm.license && `<span class="badge">${esc(s.fm.license)}</span>`,
  ]
    .filter(Boolean)
    .join("");
  const content = `
    <section class="hero sub">
      <p class="kicker">${esc(domain)}</p>
      <h1><code>${esc(s.id)}</code></h1>
      <p class="tagline">${esc(s.fm.description || "")}</p>
      ${badges ? `<p class="badges">${badges}</p>` : ""}
      <p class="back"><a href="skills.html">← all skills</a></p>
    </section>
    <section class="readme">${mdToHtml(s.body)}</section>`;
  return page(`skill/${escapeId(s.id)}.html`, title, content);
}

function agentsPage() {
  const ranked = [...agents].sort((a, b) => {
    const p = (x) => (x.fm.mode === "primary" ? 0 : 1);
    return p(a) - p(b) || a.id.localeCompare(b.id);
  });
  const cards = ranked
    .map(
      (a) => `<li class="agent-card" data-search="${esc((a.id + " " + (a.fm.description || "")).toLowerCase())}">
      <a class="agent-link" href="agent/${escapeId(a.id)}.html"><code>${esc(a.id)}</code></a>
      <span class="mode ${esc(a.fm.mode || "subagent")}">${esc(a.fm.mode || "")}</span>
      <p class="purpose">${esc(a.fm.description || "")}</p>
    </li>`
    )
    .join("");
  const content = `
    <section class="hero sub">
      <h1>Agents</h1>
      <p>Two primary entry agents (<code>orchestration-engineer</code> — Spec-Driven Development on the <a href="docs/spec-driven-development.html">Openspec workflow</a> — and <code>orchestrator</code>), plus specialist subagents that compose the domain skills per SDLC role.</p>
    </section>
    <section class="filter"><label for="agent-filter">Filter</label><input id="agent-filter" type="search" placeholder="filter agents…"></section>
    <ul class="agent-grid" id="agent-grid">${cards}</ul>`;
  return page("agents.html", "Agents", content);
}

function agentDetailPage(a) {
  const content = `
    <section class="hero sub">
      <p class="kicker">${esc(a.fm.mode || "agent")}</p>
      <h1><code>${esc(a.id)}</code></h1>
      <p class="tagline">${esc(a.fm.description || "")}</p>
      <p class="back"><a href="agents.html">← all agents</a></p>
    </section>
    <section class="readme">${mdToHtml(a.body)}</section>`;
  return page(`agent/${escapeId(a.id)}.html`, a.id, content);
}

function installPage() {
  const usage = docs.find((d) => d.id === "usage");
  const content = `
    <section class="hero sub">
      <h1>Install</h1>
      <p>Per-tool installation instructions for the skills and agents.</p>
    </section>
    <section class="readme">${mdToHtml(usage ? usage.body : "See docs/usage.md.")}</section>`;
  return page("install.html", "Install", content);
}

function docPage(d) {
  const content = `
    <section class="readme">${mdToHtml(d.body)}</section>
    <p class="back"><a href="docs/usage.html">← back to documentation</a></p>`;
  return page(`docs/${escapeId(d.id)}.html`, d.title, content);
}

/* ------------------------------------------------------------------ */
/* Emit                                                              */
/* ------------------------------------------------------------------ */

const css = `:root{--bg:#0f1115;--fg:#e6e8eb;--muted:#9aa0a6;--accent:#4f8cff;--accent-2:#36c5a5;--border:#262b33;--card:#161a21}
*{box-sizing:border-box}
body{margin:0;font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:var(--bg);color:var(--fg)}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.site-nav{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:.7rem 1.25rem;background:#0a0c10ee;border-bottom:1px solid var(--border);backdrop-filter:blur(6px)}
.site-nav .brand{font-weight:700;letter-spacing:.5px;color:var(--fg)}
.site-nav ul{display:flex;gap:1.1rem;list-style:none;margin:0;padding:0}
.site-nav a{color:var(--muted)}
.site-nav a.active{color:var(--accent-2)}
.content{max-width:960px;margin:0 auto;padding:1.5rem 1.25rem 4rem}
.hero{padding:2.5rem 0 .5rem}
.hero.sub{padding:1.25rem 0 .25rem}
h1{font-size:2.1rem;margin:.2rem 0}
.tagline{color:var(--muted);font-size:1.08rem;max-width:60ch}
.kicker{color:var(--accent-2);text-transform:uppercase;font-size:.78rem;letter-spacing:1.5px;margin:0}
.stats{display:flex;gap:2rem;margin-top:1.5rem}
.stat strong{display:block;font-size:1.9rem;color:var(--accent-2)}
.stat span{color:var(--muted);font-size:.85rem}
.domain-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.7rem;list-style:none;padding:0}
.domain-grid li{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:.8rem 1rem;display:flex;flex-direction:column}
.domain-grid span{color:var(--muted);font-size:.82rem}
.filter{margin:1rem 0;display:flex;align-items:center;gap:.6rem}
.filter input{flex:1;max-width:420px;padding:.5rem .8rem;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--fg);font-size:.95rem}
h2.domain{font-size:1.05rem;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin:2rem 0 .6rem;border-bottom:1px solid var(--border);padding-bottom:.35rem}
h2.domain .count{color:var(--accent-2)}
.skill-table{width:100%;border-collapse:collapse}
.skill-table th{text-align:left;color:var(--muted);font-size:.78rem;text-transform:uppercase;letter-spacing:1px;padding:.4rem .6rem;border-bottom:1px solid var(--border)}
.skill-table td{padding:.55rem .6rem;border-bottom:1px solid var(--border);vertical-align:top}
.skill-table .purpose{color:var(--muted);font-size:.92rem}
code{background:#1a2029;border:1px solid var(--border);border-radius:5px;padding:.1rem .35rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.88em}
pre{background:#0c0f14;border:1px solid var(--border);border-radius:10px;padding:1rem;overflow-x:auto}
pre code{background:none;border:0;padding:0}
.badges{display:flex;gap:.5rem;flex-wrap:wrap;margin:.6rem 0}
.badge{border:1px solid var(--border);border-radius:999px;padding:.15rem .7rem;font-size:.76rem;color:var(--muted)}
.back{margin-top:1rem}
.back a{font-size:.9rem}
.sdd-panel{margin:1.6rem 0 .4rem;background:linear-gradient(135deg,#14202e,#101a24);border:1px solid var(--accent);border-left:4px solid var(--accent-2);border-radius:12px;padding:1.1rem 1.3rem}
.sdd-panel .kicker{margin-bottom:.35rem}
.sdd-panel h2{margin:.1rem 0 .4rem;font-size:1.15rem}
.sdd-panel p{margin:.3rem 0;color:var(--muted)}
.agent-grid{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}
.agent-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:1rem 1.1rem}
.agent-link{font-size:1.05rem}
.mode{display:inline-block;margin-left:.5rem;border-radius:999px;padding:.1rem .6rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.6px}
.mode.primary{background:#2a4a3f;color:#7ee2c4}
.mode.subagent{background:#2a344a;color:#a8c0f5}
.agent-card .purpose{color:var(--muted);font-size:.9rem;margin:.5rem 0 0}
.readme h2{margin-top:2rem;border-bottom:1px solid var(--border);padding-bottom:.35rem}
.readme h3{margin-top:1.5rem}
.readme blockquote{border-left:3px solid var(--accent-2);margin:1rem 0;padding:.3rem 1rem;background:#141a22;color:var(--muted)}
.readme table{border-collapse:collapse;width:100%;margin:1rem 0}
.readme th,.readme td{border:1px solid var(--border);padding:.45rem .7rem;text-align:left;font-size:.92rem}
.readme th{background:#161a21;color:var(--muted)}
.site-footer{max-width:960px;margin:0 auto;padding:1.5rem 1.25rem;border-top:1px solid var(--border);color:var(--muted);font-size:.85rem}
@media(max-width:640px){.site-nav{flex-wrap:wrap;gap:.4rem}.site-nav ul{gap:.8rem}.stats{gap:1.2rem;flex-wrap:wrap}}`;

const js = `document.addEventListener("DOMContentLoaded", () => {
  for (const [filterId, targets] of [["skill-filter", "[data-search]"], ["agent-filter", "[data-search]"]]) {
    const input = document.getElementById(filterId);
    if (!input) continue;
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      document.querySelectorAll(targets).forEach((el) => {
        const hay = (el.getAttribute("data-search") || "").toLowerCase();
        el.style.display = !q || hay.includes(q) ? "" : "none";
      });
    });
  }
});`;

function emitSite() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(join(OUT, "skill"), { recursive: true });
  mkdirSync(join(OUT, "agent"), { recursive: true });
  mkdirSync(join(OUT, "docs"), { recursive: true });
  mkdirSync(join(OUT, "assets"), { recursive: true });

  writeFileSync(join(OUT, "index.html"), landingPage());
  writeFileSync(join(OUT, "skills.html"), skillsPage());
  writeFileSync(join(OUT, "agents.html"), agentsPage());
  writeFileSync(join(OUT, "install.html"), installPage());
  for (const s of skills) writeFileSync(join(OUT, "skill", `${escapeId(s.id)}.html`), skillDetailPage(s));
  for (const a of agents) writeFileSync(join(OUT, "agent", `${escapeId(a.id)}.html`), agentDetailPage(a));
  for (const d of docs) writeFileSync(join(OUT, "docs", `${escapeId(d.id)}.html`), docPage(d));
  writeFileSync(join(OUT, "assets", "site.css"), css);
  writeFileSync(join(OUT, "assets", "site.js"), js);
}

/* ------------------------------------------------------------------ */
/* Link check (--check)                                                */
/* ------------------------------------------------------------------ */

function checkLinks() {
  const hrefRe = /(?:href|src)="([^"]+)"/g;
  const errors = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith(".html")) continue;
      const html = readFileSync(full, "utf8");
      // pages render links root-relative via <base href>; resolve against it
      const baseMatch = html.match(/<base href="([^"]+)">/);
      const baseDir = baseMatch ? join(dirname(full), baseMatch[1]) : dirname(full);
      let m;
      while ((m = hrefRe.exec(html)) !== null) {
        const href = m[1];
        if (/^(https?:|mailto:|data:|#)/.test(href)) continue;
        const cleaned = href.split("#")[0].split("?")[0];
        if (!cleaned) continue;
        const target = join(baseDir, cleaned);
        if (!existsSync(target)) errors.push(`${relative(OUT, full)} -> ${href} (missing ${relative(OUT, target)})`);
      }
    }
  };
  walk(OUT);
  if (errors.length) {
    console.error(`gen-site --check: ${errors.length} broken link(s)`);
    for (const e of errors) console.error(`  ✖ ${e}`);
    process.exit(1);
  }
  console.log("gen-site --check: all internal links resolve ✓");
}

/* ------------------------------------------------------------------ */

emitSite();
console.log(`gen-site: ${OUT} — ${skills.length} skills, ${agents.length} agents, ${docs.length} docs`);
if (CHECK) checkLinks();