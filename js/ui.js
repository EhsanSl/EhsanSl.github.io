import { icon } from "./utils/dom.js";

/** Light/dark toggle. The saved choice is applied before paint by the inline script in index.html. */
export function setUpThemeToggle() {
  const button = document.getElementById("theme-toggle");
  if (!button) return;
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const current = () => root.getAttribute("data-theme") || (media.matches ? "dark" : "light");

  function sync() {
    const isDark = current() === "dark";
    button.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    button.replaceChildren(icon(isDark ? "sun" : "moon"));
  }

  button.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable: the choice lasts for this visit only */
    }
    sync();
  });
  media.addEventListener?.("change", sync);
  sync();
}

/** Fade-in on scroll. Disabled for reduced motion or old browsers; returns an observe() function. */
export function setUpReveal() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return () => {};
  document.documentElement.classList.add("js-reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  return (node) => observer.observe(node);
}

/** Highlights the nav link for the section in view. */
export function setUpNavHighlight() {
  const links = [...document.querySelectorAll(".nav-links a")];
  if (!links.length || !("IntersectionObserver" in window)) return;
  const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute("aria-current"));
        byId.get(entry.target.id)?.setAttribute("aria-current", "true");
      }
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}
