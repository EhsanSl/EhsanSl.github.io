// Loads the JSON files in /data and does light checks so mistakes show up in the console
// with the file, id and field that are wrong. The full check is `npm run validate`.

const FILES = ["site", "projects", "experience", "skills", "education"];

const REQUIRED = {
  projects: ["id", "title", "summary", "status", "category", "tech"],
  experience: ["id", "role", "org", "period"],
  skills: ["id", "label", "items"],
  education: ["id", "school", "degree", "period"],
};

async function loadFile(name) {
  const response = await fetch(`data/${name}.json`, { cache: "no-cache" });
  if (!response.ok) throw new Error(`data/${name}.json: HTTP ${response.status}`);
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`data/${name}.json is not valid JSON (${error.message})`);
  }
}

function check(name, items) {
  const required = REQUIRED[name];
  if (!required) return items;
  if (!Array.isArray(items)) {
    console.error(`[portfolio] data/${name}.json should be an array`);
    return [];
  }
  return items.filter((item, index) => {
    const missing = required.filter((key) => item[key] === undefined || item[key] === "");
    if (missing.length) {
      console.error(`[portfolio] data/${name}.json item ${item.id ?? `#${index}`} is missing: ${missing.join(", ")}`);
      return false;
    }
    return item.visible !== false;
  });
}

export async function loadData() {
  const results = await Promise.all(FILES.map(loadFile));
  const data = Object.fromEntries(FILES.map((name, i) => [name, check(name, results[i])]));
  data.projects.sort((a, b) => Number(b.featured) - Number(a.featured) || (a.order ?? 99) - (b.order ?? 99));
  return data;
}
