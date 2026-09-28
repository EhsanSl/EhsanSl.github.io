// Small DOM helpers. All text goes in through textContent, never innerHTML,
// so nothing in the data files can inject markup.

const ICON_SPRITE = "images/icons.svg";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value === true ? "" : value);
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function icon(name) {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(svgNS, "use");
  use.setAttribute("href", `${ICON_SPRITE}#i-${name}`);
  svg.append(use);
  return svg;
}

/** Clone a <template> and return its first element plus a lookup for [data-field] nodes. */
export function fromTemplate(id) {
  const tpl = document.getElementById(id);
  if (!tpl) throw new Error(`Missing <template id="${id}"> in index.html`);
  const root = tpl.content.firstElementChild.cloneNode(true);
  const field = (name) => root.querySelector(`[data-field="${name}"]`);
  return { root, field };
}

export function slot(name) {
  return document.querySelector(`[data-slot="${name}"]`);
}

/** Only allow http(s), mailto and relative URLs into href attributes. */
export function safeUrl(url) {
  if (typeof url !== "string" || !url.trim()) return null;
  try {
    const parsed = new URL(url, document.baseURI);
    return ["http:", "https:", "mailto:"].includes(parsed.protocol) ? url : null;
  } catch {
    return null;
  }
}

export function formatMonth(value) {
  if (!value) return "";
  const [year, month] = String(value).split("-");
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : year;
}

/** { start: "2022-06", end: "2023-12" | null, endLabel?: "expected 2027" } -> "Jun 2022 – Dec 2023" */
export function formatPeriod(period) {
  if (!period || !period.start) return "";
  const start = formatMonth(period.start);
  const end = period.endLabel || (period.end ? formatMonth(period.end) : "Present");
  if (period.end && period.end === period.start) return start;
  return `${start} – ${end}`;
}

/** Wraps numbers such as 99.8%, 30%, +5% in <span class="metric"> for emphasis. */
export function withMetrics(text) {
  const fragment = document.createDocumentFragment();
  const pattern = /([+-]?\d+(?:\.\d+)?%)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    fragment.append(text.slice(last, match.index));
    fragment.append(el("span", { class: "metric", text: match[0] }));
    last = match.index + match[0].length;
  }
  fragment.append(text.slice(last));
  return fragment;
}

export function tagList(items, limit = Infinity) {
  const shown = items.slice(0, limit);
  const nodes = shown.map((item) => el("li", { class: "tag", text: item }));
  if (items.length > limit) nodes.push(el("li", { class: "tag", text: `+${items.length - limit}` }));
  return nodes;
}
