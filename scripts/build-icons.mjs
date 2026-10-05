// Builds images/icons.svg (an SVG sprite) from Font Awesome Free's individual SVGs.
// Only the icons listed below are included. Add a name here and run `npm run icons`.
import { readFileSync, writeFileSync } from "node:fs";

const ICONS = [
  ["brands", "github"],
  ["brands", "linkedin"],
  ["solid", "envelope"],
  ["solid", "download"],
  ["solid", "arrow-up-right-from-square"],
  ["solid", "sun"],
  ["solid", "moon"],
  ["solid", "xmark"],
  ["solid", "location-dot"],
  ["solid", "chevron-down"],
];

const base = "node_modules/@fortawesome/fontawesome-free/svgs";
const symbols = ICONS.map(([set, name]) => {
  const svg = readFileSync(`${base}/${set}/${name}.svg`, "utf8");
  const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
  const paths = [...svg.matchAll(/<path d="([^"]+)"/g)].map((m) => `<path d="${m[1]}"/>`).join("");
  return `<symbol id="i-${name}" viewBox="${viewBox}">${paths}</symbol>`;
});

const out = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols.join("\n")}\n</svg>\n`;
writeFileSync("images/icons.svg", out);
console.log(`icons.svg written (${ICONS.length} icons, ${out.length} bytes)`);
