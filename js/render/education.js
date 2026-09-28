import { fromTemplate, slot, formatPeriod } from "../utils/dom.js";

export function renderEducation(items) {
  slot("education").replaceChildren(
    ...items.map((item) => {
      const { root, field } = fromTemplate("tpl-education");
      field("school").textContent = item.school;
      field("degree").textContent = item.degree;
      field("period").textContent = [formatPeriod(item.period), item.location].filter(Boolean).join(" · ");
      const notes = field("notes");
      if (item.notes?.length) notes.textContent = item.notes.join(" ");
      else notes.remove();
      return root;
    })
  );
}
