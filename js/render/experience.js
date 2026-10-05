import { el, fromTemplate, slot, formatPeriod, withMetrics } from "../utils/dom.js";

export function renderExperience(items) {
  slot("experience").replaceChildren(
    ...items.map((item) => {
      const { root, field } = fromTemplate("tpl-experience");
      field("role").textContent = item.role;
      field("org").textContent = item.org;
      field("period").textContent = formatPeriod(item.period);
      const focus = field("focus");
      if (item.focus || item.location) focus.textContent = [item.focus, item.location].filter(Boolean).join(" · ");
      else focus.remove();
      const list = field("highlights");
      if (item.highlights?.length) list.replaceChildren(...item.highlights.map((h) => el("li", {}, [withMetrics(h)])));
      else list.remove();
      return root;
    })
  );
}
