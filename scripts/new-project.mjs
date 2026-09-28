// Adds a project to data/projects.json by asking a few questions. Run: npm run new:project
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createInterface } from "node:readline";
import { stdin as input, stdout as output } from "node:process";

const FILE = "data/projects.json";
const STATUSES = ["shipped", "research", "in-progress", "archived"];
const rl = createInterface({ input, terminal: false });
const lines = rl[Symbol.asyncIterator]();
async function ask(question, fallback = "") {
  output.write(fallback ? `${question} [${fallback}]: ` : `${question}: `);
  const { value, done } = await lines.next();
  if (!input.isTTY) output.write("\n");
  return (done ? "" : value).trim() || fallback;
}
const list = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

const projects = JSON.parse(readFileSync(FILE, "utf8"));
const title = await ask("Title");
const suggested = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
let id = await ask("Id (lowercase-with-dashes)", suggested);
while (projects.some((p) => p.id === id)) id = await ask(`"${id}" is taken, pick another id`);

const summary = await ask("One- or two-sentence summary");
const role = await ask("Your role (e.g. Solo project, Research assistant, Course project (team))", "Solo project");
let status = await ask(`Status (${STATUSES.join(" / ")})`, "shipped");
while (!STATUSES.includes(status)) status = await ask(`Status must be one of ${STATUSES.join(", ")}`, "shipped");
const start = await ask("Start month (YYYY-MM, blank to skip)");
const end = start ? await ask("End month (YYYY-MM, blank if ongoing)") : "";
const category = list(await ask("Categories, comma separated (e.g. machine-learning, web, backend, tools)"));
const tech = list(await ask("Tech, comma separated (e.g. Python, Flask, SQLite)"));
const highlights = [];
for (let i = 1; i <= 3; i++) {
  const h = await ask(`Highlight ${i} (an outcome, ideally with a number; blank to stop)`);
  if (!h) break;
  highlights.push(h);
}
const links = {};
for (const kind of ["code", "live", "paper", "slides", "video"]) {
  const url = await ask(`Link: ${kind} (blank to skip)`);
  if (url) links[kind] = url;
}
const featured = (await ask("Show in the main grid? (y/n)", "y")).toLowerCase().startsWith("y");
rl.close();

const project = {
  id, title, summary, role,
  ...(start ? { period: { start, end: end || null } } : {}),
  status, category, tech, highlights, links,
  image: null,
  featured, visible: true,
  order: Math.max(0, ...projects.map((p) => p.order ?? 0)) + 1,
};
projects.push(project);
writeFileSync(FILE, JSON.stringify(projects, null, 2) + "\n");
mkdirSync("images/projects", { recursive: true });

console.log(`\nAdded "${title}" to ${FILE}.`);
console.log(`To add an image: save it as images/projects/${id}.webp (3:2, about 900x600) and set`);
console.log(`  "image": { "src": "images/projects/${id}.webp", "alt": "<describe the image>" }`);
console.log("Then run: npm run validate");
