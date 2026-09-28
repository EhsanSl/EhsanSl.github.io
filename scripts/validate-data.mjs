// Checks every file in data/ before you commit. Run: npm run validate
// Errors (exit code 1) break the site; warnings are things worth fixing.
import { readFileSync, existsSync } from "node:fs";

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const STATUSES = ["shipped", "research", "in-progress", "archived"];
const LINK_KINDS = ["live", "demo", "code", "paper", "slides", "video"];
const MONTH = /^\d{4}(-(0[1-9]|1[0-2]))?$/;

function load(name) {
  const path = `data/${name}.json`;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    err(path, `cannot read or parse (${e.message})`);
    return null;
  }
}

function checkUrl(where, url) {
  if (typeof url !== "string" || !url) return err(where, "URL is empty");
  if (/^(https?:|mailto:)/.test(url)) {
    try { new URL(url); } catch { err(where, `malformed URL "${url}"`); }
    return;
  }
  const local = url.split(/[?#]/)[0];
  if (!existsSync(local)) err(where, `local file "${local}" does not exist`);
}

function checkPeriod(where, period, required) {
  if (!period) { if (required) err(where, "period is required"); return; }
  if (!MONTH.test(period.start || "")) err(where, `period.start "${period.start}" should look like 2024-09`);
  if (period.end !== null && period.end !== undefined && !MONTH.test(period.end)) err(where, `period.end "${period.end}" should look like 2024-09 or null (ongoing)`);
  if (period.end && period.start && period.end < period.start) err(where, "period.end is before period.start");
}

function checkList(name, items, required) {
  if (!Array.isArray(items)) return err(`data/${name}.json`, "should be an array");
  const ids = new Set();
  items.forEach((item, i) => {
    const where = `data/${name}.json [${item.id ?? `#${i}`}]`;
    for (const key of required) if (item[key] === undefined || item[key] === "") err(where, `missing "${key}"`);
    if (item.id) {
      if (!/^[a-z0-9-]+$/.test(item.id)) err(where, "id should be lowercase-with-dashes");
      if (ids.has(item.id)) err(where, "duplicate id");
      ids.add(item.id);
    }
    if (item.todo) warn(where, `TODO: ${item.todo}`);
  });
}

// site.json
const site = load("site");
if (site) {
  for (const key of ["name", "title", "tagline", "email", "cv", "about", "links"]) if (!site[key]) err("data/site.json", `missing "${key}"`);
  if (site.cv) checkUrl("data/site.json cv", site.cv);
  if (site.portrait?.src) checkUrl("data/site.json portrait", site.portrait.src);
  (site.links || []).forEach((l) => checkUrl(`data/site.json link ${l.id}`, l.url));
  if (site.todo) warn("data/site.json", `TODO: ${site.todo}`);
}

// projects.json
const projects = load("projects");
if (projects) {
  checkList("projects", projects, ["id", "title", "summary", "status", "category", "tech"]);
  for (const p of projects) {
    const where = `data/projects.json [${p.id}]`;
    if (p.status && !STATUSES.includes(p.status)) err(where, `status must be one of ${STATUSES.join(", ")}`);
    if (p.category && !Array.isArray(p.category)) err(where, "category must be an array");
    if (p.tech && !Array.isArray(p.tech)) err(where, "tech must be an array");
    if (p.period) checkPeriod(where, p.period, false);
    for (const [kind, url] of Object.entries(p.links || {})) {
      if (!LINK_KINDS.includes(kind)) warn(where, `unknown link type "${kind}" (known: ${LINK_KINDS.join(", ")})`);
      checkUrl(`${where} links.${kind}`, url);
    }
    if (p.image) {
      checkUrl(`${where} image`, p.image.src);
      if (!p.image.alt) err(where, "image.alt is required (describe the image)");
    }
    if (p.visible !== false && p.featured) {
      if (!Object.keys(p.links || {}).length) warn(where, "featured project has no links");
      if (!p.image) warn(where, "featured project has no image (a placeholder is shown)");
      if (!p.highlights?.length) warn(where, "featured project has no highlights");
    }
    if (p.summary && p.summary.length > 220) warn(where, `summary is ${p.summary.length} chars; cards read best under ~200`);
  }
}

// experience.json
const experience = load("experience");
if (experience) {
  checkList("experience", experience, ["id", "role", "org", "period"]);
  experience.forEach((x) => checkPeriod(`data/experience.json [${x.id}]`, x.period, true));
}

// skills.json
const skills = load("skills");
if (skills) {
  checkList("skills", skills, ["id", "label", "items"]);
  skills.forEach((s) => { if (!Array.isArray(s.items) || !s.items.length) err(`data/skills.json [${s.id}]`, "items must be a non-empty array"); });
}

// education.json
const education = load("education");
if (education) {
  checkList("education", education, ["id", "school", "degree", "period"]);
  education.forEach((x) => {
    const where = `data/education.json [${x.id}]`;
    if (x.period?.start && !MONTH.test(x.period.start)) err(where, `period.start "${x.period.start}" should look like 2024-09`);
  });
}

for (const w of warnings) console.log(`  warn   ${w}`);
for (const e of errors) console.log(`  ERROR  ${e}`);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
