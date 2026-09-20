// check-eval-cases.mjs — asserts every skill has an execution eval case.
// Execution evals sweep: evals/cases/<skill-name>.md must exist for every skill.
// Zero dependencies (Node stdlib only).
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const skills = readdirSync(join(ROOT, "skills")).filter((d) => d !== ".DS_Store");
const cases = readdirSync(join(ROOT, "evals", "cases"))
  .filter((f) => f.endsWith(".md") && f !== "README.md");

const missing = [];
for (const s of skills) {
  if (!cases.includes(`${s}.md`)) missing.push(s);
}
for (const c of cases) {
  if (!skills.includes(c.replace(/\.md$/, ""))) {
    console.log(`WARN: eval case without a skill: ${c}`);
  }
}
if (missing.length) {
  console.error(`FAIL: ${missing.length} skills missing an execution eval case:`);
  for (const s of missing) console.error(`  - ${s}`);
  process.exit(1);
}
console.log(`check-eval-cases: ${skills.length} skills, ${skills.length} eval cases — full coverage`);