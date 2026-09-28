import { loadData } from "./data.js";
import { renderSite } from "./render/site.js";
import { renderProjects } from "./render/projects.js";
import { renderExperience } from "./render/experience.js";
import { renderSkills } from "./render/skills.js";
import { renderEducation } from "./render/education.js";
import { setUpThemeToggle, setUpReveal, setUpNavHighlight } from "./ui.js";
import { el, slot } from "./utils/dom.js";

async function start() {
  setUpThemeToggle();
  const observe = setUpReveal();

  let data;
  try {
    data = await loadData();
  } catch (error) {
    console.error("[portfolio]", error);
    slot("projects").replaceChildren(
      el("li", { class: "empty-state", text: "Couldn't load the project data. If you opened index.html directly from disk, run `npm run dev` instead." })
    );
    return;
  }

  renderSite(data.site);
  renderProjects(data.projects, data.site.categoryLabels, observe);
  renderExperience(data.experience);
  renderSkills(data.skills);
  renderEducation(data.education);

  document.querySelectorAll(".reveal").forEach(observe);
  setUpNavHighlight();
}

start();
