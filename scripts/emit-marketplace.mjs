// emit-marketplace.mjs — emits registry.yaml + marketplace manifests from skills/ + agents/.
// Single source of truth: the filesystem. Deterministic output (CI-freshness checkable).
// Zero dependencies (Node stdlib only).
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SKILLS = join(ROOT, "skills");
const AGENTS = join(ROOT, "agents");
const VERSION = "1.0.0";

function frontmatter(file) {
  const text = readFileSync(file, "utf8");
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error(`missing frontmatter: ${file}`);
  const fm = {};
  let inMetadata = false;
  for (const line of m[1].split("\n")) {
    if (/^metadata:$/.test(line)) { inMetadata = true; continue; }
    const nested = line.match(/^  ([a-z-]+):\s*(.*)$/);
    const top = line.match(/^([a-z-]+):\s*(.*)$/);
    if (inMetadata && nested) {
      fm[nested[1]] = nested[2];
    } else if (top) {
      fm[top[1]] = top[2];
      if (top[1] !== "metadata") inMetadata = false;
    }
  }
  if (!fm.name) fm.name = file.split("/").slice(-2)[0];
  return fm;
}

const skills = readdirSync(SKILLS)
  .filter((d) => d !== ".DS_Store")
  .map((d) => {
    const fm = frontmatter(join(SKILLS, d, "SKILL.md"));
    return {
      id: d,
      description: (fm.description || "").replace(/^"|"$/g, "").trim(),
      domain: fm.domain || "unknown",
    };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

const agents = readdirSync(AGENTS)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const fm = frontmatter(join(AGENTS, f));
    return {
      id: f.replace(/\.md$/, ""),
      description: (fm.description || "").replace(/^"|"$/g, "").trim(),
      mode: fm.mode || "subagent",
    };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

// --- registry.yaml ---------------------------------------------------------
const yaml = [
  "version: 1",
  "description: ai-atlas — SDLC skills and agents for AI coding assistants",
  "skills:",
  ...skills.map((s) => `  - id: ${s.id}\n    domain: ${s.domain}\n    description: "${s.description.replace(/"/g, "'")}"`),
  "agents:",
  ...agents.map((a) => `  - id: ${a.id}\n    mode: ${a.mode}\n    description: "${a.description.replace(/"/g, "'")}"`),
].join("\n") + "\n";
writeFileSync(join(ROOT, "registry.yaml"), yaml);

// --- marketplace manifests (phase 2: released for native plugin installs) --
const plugin = (s) => ({
  name: s.id,
  description: s.description,
  path: `skills/${s.id}`,
});
const manifest = (name, description) => ({
  name,
  description,
  version: VERSION,
  plugins: skills.map(plugin),
});

const claudeMarket = manifest("ai-atlas", "SDLC skills for AI coding assistants (54 skills, OpenCode-first).");
mkdirSync(join(ROOT, ".claude-plugin"), { recursive: true });
writeFileSync(join(ROOT, ".claude-plugin", "marketplace.json"), JSON.stringify(claudeMarket, null, 2) + "\n");

const agentsMarket = manifest("ai-atlas", "SDLC skills for AI coding assistants (54 skills, OpenCode-first).");
mkdirSync(join(ROOT, ".agents", "plugins"), { recursive: true });
writeFileSync(join(ROOT, ".agents", "plugins", "marketplace.json"), JSON.stringify(agentsMarket, null, 2) + "\n");

console.log(`emit-marketplace: ${skills.length} skills, ${agents.length} agents -> registry.yaml, .claude-plugin/marketplace.json, .agents/plugins/marketplace.json`);