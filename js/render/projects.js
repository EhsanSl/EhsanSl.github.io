import { el, icon, fromTemplate, slot, safeUrl, formatPeriod, tagList, withMetrics } from "../utils/dom.js";

const LINK_LABELS = { live: "Live site", demo: "Demo", code: "Code", paper: "Paper", slides: "Slides", video: "Video" };
const STATUS_LABELS = { shipped: "Shipped", research: "Research", "in-progress": "In progress", archived: "Archived" };

function humanize(slug, labels) {
  if (labels && labels[slug]) return labels[slug];
  return slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function linkButtons(project, className) {
  const links = Object.entries(project.links || {})
    .filter(([, url]) => safeUrl(url))
    .map(([kind, url]) =>
      el("a", { class: className, href: url, target: "_blank", rel: "noopener" }, [
        LINK_LABELS[kind] || humanize(kind),
        icon("arrow-up-right-from-square"),
      ])
    );
  // Private repos: say so, so a missing code link doesn't look like an oversight.
  if (project.private && !project.links?.code) links.push(el("span", { class: "private-note", text: "Private repo" }));
  return links;
}

function media(project, labels) {
  if (project.image && safeUrl(project.image.src)) {
    return el("img", { src: project.image.src, alt: project.image.alt || "", loading: "lazy", decoding: "async", width: 300, height: 200 });
  }
  // No image yet: a patterned block labelled with the project's first category.
  return el("div", { class: "project-card__placeholder", "aria-hidden": "true", text: humanize(project.category[0] || "", labels) });
}

function card(project, onOpen, labels) {
  const { root, field } = fromTemplate("tpl-project-card");
  root.dataset.id = project.id;
  field("media").append(media(project, labels));
  const badge = field("status");
  badge.textContent = STATUS_LABELS[project.status] || project.status;
  badge.classList.add(`badge--${project.status}`);
  field("period").textContent = formatPeriod(project.period);
  const title = field("title");
  title.textContent = project.title;
  title.setAttribute("aria-haspopup", "dialog");
  title.addEventListener("click", () => onOpen(project, title));
  field("summary").textContent = project.summary;
  field("tech").replaceChildren(...tagList(project.tech, 4));
  field("links").replaceChildren(...linkButtons(project, "btn btn--ghost btn--sm"));
  return root;
}

function miniItem(project, onOpen) {
  const { root, field } = fromTemplate("tpl-mini-project");
  field("title").textContent = project.title;
  field("summary").textContent = project.summary;
  field("tech").replaceChildren(...tagList(project.tech, 4));
  const links = linkButtons(project, "");
  if (project.highlights?.length) {
    const details = el("a", { href: `#${project.id}`, role: "button", text: "Details" });
    details.addEventListener("click", (event) => {
      event.preventDefault();
      onOpen(project, details);
    });
    links.unshift(details);
  }
  field("links").replaceChildren(...links);
  return root;
}

function dialogContent(project) {
  const nodes = [
    el("span", { class: `badge badge--${project.status}`, text: STATUS_LABELS[project.status] || project.status }),
    el("h2", { id: "dialog-title", text: project.title }),
    el("p", { class: "project-dialog__meta", text: [project.role, formatPeriod(project.period)].filter(Boolean).join(" · ") }),
  ];
  if (project.image && safeUrl(project.image.src)) {
    nodes.push(el("img", { class: "project-dialog__img", src: project.image.src, alt: project.image.alt || "", width: 300, height: 200 }));
  }
  nodes.push(el("p", { text: project.summary }));
  if (project.highlights?.length) {
    nodes.push(el("h3", { text: "Highlights" }));
    nodes.push(el("ul", { class: "highlights" }, project.highlights.map((h) => el("li", {}, [withMetrics(h)]))));
  }
  nodes.push(el("h3", { text: "Tech" }));
  nodes.push(el("ul", { class: "tags" }, tagList(project.tech)));
  const links = linkButtons(project, "btn btn--primary btn--sm");
  if (links.length) nodes.push(el("div", { class: "project-dialog__links" }, links));
  return nodes;
}

function setUpDialog() {
  const dialog = document.getElementById("project-dialog");
  let opener = null;
  dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
  // Click on the backdrop (outside the inner box) closes the dialog.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => opener?.focus());
  return (project, trigger) => {
    opener = trigger;
    slot("dialog").replaceChildren(...dialogContent(project));
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  };
}

export function renderProjects(projects, labels = {}, observe = () => {}) {
  const open = setUpDialog();
  const grid = slot("projects");
  const moreWrap = slot("more-projects-wrap");
  const moreList = slot("more-projects");
  const empty = slot("projects-empty");

  // Filter chips: categories used by at least two projects, most common first.
  const counts = new Map();
  projects.flatMap((p) => p.category).forEach((c) => counts.set(c, (counts.get(c) || 0) + 1));
  const categories = [...counts].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([c]) => c);
  let active = "all";

  function draw() {
    const inGrid = active === "all" ? projects.filter((p) => p.featured) : projects.filter((p) => p.category.includes(active));
    const rest = active === "all" ? projects.filter((p) => !p.featured) : [];
    grid.replaceChildren(...inGrid.map((p) => card(p, open, labels)));
    moreList.replaceChildren(...rest.map((p) => miniItem(p, open)));
    moreWrap.hidden = rest.length === 0;
    empty.hidden = inGrid.length > 0;
    grid.querySelectorAll(".reveal").forEach(observe);
  }

  const filters = slot("project-filters");
  const buttons = ["all", ...categories].map((category) => {
    const button = el("button", {
      class: "chip-btn",
      type: "button",
      "aria-pressed": String(category === active),
      text: category === "all" ? "All" : humanize(category, labels),
    });
    button.addEventListener("click", () => {
      active = category;
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      draw();
    });
    return button;
  });
  filters.replaceChildren(...buttons.map((b) => el("li", {}, [b])));

  draw();
}
