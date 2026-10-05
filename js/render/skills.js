import { fromTemplate, slot, tagList } from "../utils/dom.js";

export function renderSkills(groups) {
  slot("skills").replaceChildren(
    ...groups.map((group) => {
      const { root, field } = fromTemplate("tpl-skill-group");
      field("label").textContent = group.label;
      field("items").replaceChildren(...tagList(group.items));
      return root;
    })
  );
}
