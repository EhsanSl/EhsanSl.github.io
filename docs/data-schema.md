# Data schema

All content lives in `data/`. Every list item has an `id` (lowercase-with-dashes, unique in its file), an optional `visible` (default `true`) and an optional `todo` (a private reminder, never rendered). Dates are `"YYYY-MM"` strings. Run `npm run validate` after editing.

## Periods

```json
"period": { "start": "2022-06", "end": "2023-12" }
```

- `end: null` means ongoing and renders as "Present".
- `endLabel` overrides the end text, e.g. `"endLabel": "expected 2027"`.
- If `start` and `end` are the same month, only one month is shown.

## data/site.json

| Field            | Required | Notes                                                          |
| ---------------- | -------- | -------------------------------------------------------------- |
| `name`           | yes      | Nav, hero and footer                                           |
| `title`          | yes      | Hero headline under the name                                   |
| `tagline`        | yes      | One or two sentences in the hero                               |
| `availability`   | no       | Line with the green dot in the hero                            |
| `location`       | no       | Shown in the hero                                              |
| `email`          | yes      | Shown in the contact section                                   |
| `cv`             | yes      | Path to the CV PDF                                             |
| `portrait`       | no       | `{ "src", "alt" }`                                             |
| `about`          | yes      | Array of paragraphs                                            |
| `links`          | yes      | `[{ "id", "label", "url", "icon" }]`; `icon` must exist in `images/icons.svg` (github, linkedin, envelope, …) |
| `contactForm`    | no       | Formspree endpoint for the contact form                        |
| `categoryLabels` | no       | Display names for project categories, e.g. `"nlp": "NLP"`      |

`index.html` also has a static copy of the key facts (the `<title>`, meta description, Open Graph tags and JSON-LD) for search engines and link previews. If you change your name or headline, update those too.

## data/projects.json

```json
{
  "id": "vanet",
  "title": "Secure communication for vehicular networks (VANET)",
  "summary": "One or two sentences. Shown on the card.",
  "role": "Research assistant",
  "period": { "start": "2022-06", "end": "2023-12" },
  "status": "research",
  "category": ["machine-learning", "research"],
  "tech": ["Python", "scikit-learn"],
  "highlights": ["99.8% signal-transmission accuracy for autonomous-vehicle communication."],
  "links": { "slides": "https://…", "code": "https://github.com/…" },
  "image": { "src": "images/projects/vanet.webp", "alt": "Title slide of the VANET talk" },
  "featured": true,
  "visible": true,
  "order": 2
}
```

| Field        | Required | Notes                                                                    |
| ------------ | -------- | ------------------------------------------------------------------------ |
| `title`      | yes      |                                                                          |
| `summary`    | yes      | Aim for under ~200 characters                                            |
| `status`     | yes      | `shipped`, `research`, `in-progress` or `archived` (shown as a badge)    |
| `category`   | yes      | Array; drives the filter chips. The first one labels the image placeholder |
| `tech`       | yes      | Array; the card shows the first four                                     |
| `role`       | no       | Shown in the details dialog                                              |
| `period`     | no       |                                                                          |
| `highlights` | no       | Outcome bullets for the details dialog                                   |
| `links`      | no       | Any of `live`, `demo`, `code`, `paper`, `slides`, `video`                |
| `private`    | no       | `true` shows a "Private repo" note when there's no `code` link          |
| `image`      | no       | `null` shows a placeholder; `alt` is required when set                   |
| `featured`   | no       | `true` puts it in the main grid                                          |
| `order`      | no       | Lower comes first within its group                                       |

## data/experience.json

| Field        | Required | Notes                                       |
| ------------ | -------- | ------------------------------------------- |
| `role`       | yes      | e.g. "Research Assistant"                   |
| `org`        | yes      | e.g. "University of Windsor"                |
| `period`     | yes      |                                             |
| `focus`      | no       | Project or team, shown under the role       |
| `location`   | no       |                                             |
| `type`       | no       | `industry`, `research` or `teaching` (not rendered yet; reserved for filtering) |
| `highlights` | no       | Bullets; percentages are emphasized         |

Entries render in file order, so keep the newest first.

## data/skills.json

`[{ "id", "label", "items": ["Python", …] }]`, rendered as one card of chips per group, in file order.

## data/education.json

| Field      | Required | Notes                               |
| ---------- | -------- | ----------------------------------- |
| `school`   | yes      |                                     |
| `degree`   | yes      |                                     |
| `period`   | yes      | `endLabel` works here too           |
| `location` | no       |                                     |
| `notes`    | no       | Array of short lines (awards etc.)  |
