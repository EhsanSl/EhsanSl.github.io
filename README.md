# EhsanSl.github.io

Personal portfolio of Ehsan Salimi, served by GitHub Pages at <https://ehsansl.github.io/>.

It's a static site with no framework and no build step at deploy time. `index.html` holds the page layout and a set of `<template>` blocks. Small ES modules in `js/` fill those blocks from the JSON files in `data/`. **To update the site, you edit data, not HTML.**

## Updating content

| To change…                          | Edit                                                                  |
| ----------------------------------- | --------------------------------------------------------------------- |
| Name, headline, tagline, about text | `data/site.json`                                                      |
| Availability line, location, email  | `data/site.json`                                                      |
| GitHub / LinkedIn / email links     | `data/site.json` → `links`                                            |
| Projects                            | `data/projects.json` (or run `npm run new:project`)                   |
| Jobs, research and teaching roles   | `data/experience.json`                                                |
| Skills                              | `data/skills.json`                                                    |
| Degrees                             | `data/education.json`                                                 |
| CV                                  | replace `files/Ehsan_Salimi_CV.pdf` (keep the name, or update `cv` in `site.json`) |
| Colours, spacing, fonts             | `scss/_tokens.scss`, then `npm run sass:build`                        |

Field-by-field reference: [docs/data-schema.md](docs/data-schema.md).

A few rules the renderer follows, so you know what to expect:

- Projects with `"featured": true` go in the main grid. The rest go under "More things I've built". Within each group they're sorted by `order`.
- `"visible": false` hides an entry without deleting it.
- Link buttons only appear for links that exist. Supported types: `live`, `demo`, `code`, `paper`, `slides`, `video`.
- The filter chips are built from `category` values that at least two projects share.
- Numbers like `99.8%` or `+5%` in highlights are emphasized automatically.
- An optional `"todo"` field on any entry is never shown on the site. `npm run validate` prints it as a reminder.

### Adding a project

```bash
npm run new:project        # answers a few questions and appends to data/projects.json
```

Then add an image at `images/projects/<id>.webp` (3:2, around 900×600) and set `"image": { "src": "...", "alt": "..." }`. Without an image, the card shows a patterned placeholder labelled with the project's first category.

## Running locally

```bash
npm install          # once
npm run dev          # serves the site at http://localhost:5173
```

You can't open `index.html` by double-clicking. Browsers block `fetch()` for the data files on `file://`, so use `npm run dev`.

## Checks

```bash
npm run validate     # checks every data file: required fields, ids, dates, links, image paths
```

The same check runs on GitHub (`.github/workflows/validate.yml`) for every push to `main` and every pull request.

## Styles and icons

- `scss/main.scss` imports only the Bootstrap parts the site uses (reboot and containers) plus `_tokens.scss`, `_base.scss` and `_components.scss`. It compiles to `css/styles.css` via `npm run sass:build` (or `npm run sass:watch` while editing). Never edit `css/styles.css` by hand.
- Icons are an SVG sprite at `images/icons.svg`, built from Font Awesome Free by `npm run icons`. To add an icon, add its name to the list in `scripts/build-icons.mjs` and rerun the script.
- Fonts are self-hosted in `fonts/` (Poppins 400/600/700, Latin subset).

## Deploying

Merge to `main` and push. GitHub Pages serves the repository as-is (`.nojekyll` turns off Jekyll processing). Commit the compiled `css/styles.css` and `images/icons.svg`, because Pages doesn't run npm.

## Layout

```
index.html            page layout + <template> blocks
data/*.json           all content
js/main.js            entry: loads data, calls the renderers
js/data.js            fetch + light checks
js/render/*.js        one renderer per section
js/ui.js              theme toggle, scroll reveal, nav highlight
js/utils/dom.js       safe DOM helpers (text only, no innerHTML)
scss/                 styles (source)   →  css/styles.css (compiled)
scripts/              validate-data, new-project, build-icons
images/ fonts/ files/ assets
404.html robots.txt sitemap.xml favicon.* 
```
