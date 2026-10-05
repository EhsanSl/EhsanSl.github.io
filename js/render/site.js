import { el, icon, safeUrl, slot } from "../utils/dom.js";

/** Fills [data-bind] text, social links, about text and footer year from data/site.json. */
export function renderSite(site) {
  for (const node of document.querySelectorAll("[data-bind]")) {
    const value = site[node.dataset.bind];
    if (typeof value === "string") node.textContent = value;
  }
  for (const node of document.querySelectorAll("[data-bind-href]")) {
    const url = safeUrl(site[node.dataset.bindHref]);
    if (url) node.setAttribute("href", url);
  }
  for (const node of document.querySelectorAll("[data-bind-action]")) {
    const url = safeUrl(site[node.dataset.bindAction]);
    if (url) node.setAttribute("action", url);
  }

  if (site.portrait) {
    const img = document.querySelector(".hero__portrait img");
    if (img && safeUrl(site.portrait.src)) {
      img.src = site.portrait.src;
      img.alt = site.portrait.alt || "";
    }
  }

  const links = (site.links || []).filter((link) => safeUrl(link.url));

  slot("social").replaceChildren(
    ...links.map((link) =>
      el("li", {}, [
        el("a", { class: "icon-btn", href: link.url, "aria-label": link.label, rel: "me noopener", target: link.url.startsWith("mailto:") ? null : "_blank" }, [icon(link.icon)]),
      ])
    )
  );

  slot("contact-links").replaceChildren(
    ...links.map((link) =>
      el("li", {}, [
        el("a", { href: link.url, rel: "noopener", target: link.url.startsWith("mailto:") ? null : "_blank" }, [
          icon(link.icon),
          link.id === "email" ? site.email : link.label,
        ]),
      ])
    )
  );

  slot("about").replaceChildren(...(site.about || []).map((paragraph) => el("p", { text: paragraph })));
  slot("year").textContent = String(new Date().getFullYear());
}
