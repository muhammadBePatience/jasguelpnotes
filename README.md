# Lecture Hub

A personal site for keeping university lectures — notes, slides, recordings and
flashcards — organised by course and reviewable at any time.

No frameworks, no build tooling beyond one plain Node script, no server
required. It's plain HTML, CSS and JavaScript, so it will still open in ten
years.

---

## Running it

```bash
# from the project folder
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

You can also just double-click `index.html` — it works from `file://` too,
because the content is compiled into a plain `.js` file rather than fetched.

## Adding content

```bash
# 1. write a lecture
cp docs/_TEMPLATE.md data/lectures/cs240/week-04-hash-tables.md

# 2. rebuild
node build.js

# 3. refresh the browser
```

Full format reference: [`docs/ADDING-A-LECTURE.md`](docs/ADDING-A-LECTURE.md).
How to use the site day to day (including installing it on a phone):
[`docs/FOR-YOUR-SON.md`](docs/FOR-YOUR-SON.md).

## Adding a subject

Two steps. Say the new subject is Physics 121:

1. Add it to the `courses` list in `data/courses.json`:

   ```json
   {
     "id": "phys121",
     "code": "PHYS 121",
     "name": "Mechanics",
     "instructor": "Dr. S. Patel",
     "term": "Fall 2026"
   }
   ```

2. Make a folder with **exactly** that `id` and put lectures in it:

   ```bash
   mkdir -p data/lectures/phys121
   cp docs/_TEMPLATE.md data/lectures/phys121/week-01-kinematics.md
   node build.js
   ```

The `id` and the folder name must match — that's the only rule. Courses appear
in the order they're listed in the JSON.

## Changing the name on the welcome banner

`data/courses.json` → `site.student`. Rebuild and it updates everywhere.

## Folder structure

```
.
├── index.html              Dashboard — welcome, resume, every course, global search
├── course.html             One course — its lectures, filters, progress
├── lecture.html            One lecture — notes, resources, flashcards
├── quiz.html               Quiz me — flashcards from every course, weighted by weakness
├── build.js                Compiles data/ → assets/js/content.js. Run after edits.
├── sw.js                   Service worker — makes the site work with no signal
├── manifest.webmanifest    Lets it install to a phone home screen
│
├── assets/
│   ├── css/
│   │   └── styles.css      All styling. Two themes via CSS variables.
│   └── js/
│       ├── content.js      GENERATED — do not edit by hand
│       ├── store.js        Progress + theme, saved in the browser
│       ├── app.js          Shared helpers and the sidebar
│       ├── page-index.js   Dashboard logic
│       ├── page-course.js  Course page logic
│       └── page-lecture.js Lecture page logic
│
├── data/                   ◀── the only folder you edit day to day
│   ├── courses.json        The list of courses
│   └── lectures/
│       ├── cs240/          One markdown file per lecture
│       └── math235/
│
├── files/                  Optional: PDFs and slides you want to host yourself
│
└── docs/
    ├── ADDING-A-LECTURE.md Format reference
    └── _TEMPLATE.md        Copy this to start a new lecture
```

## Features

- **Works offline** — installs to a phone home screen and opens with no signal
  at all, which is the whole point on a bus
- **Browse** by course, then by week
- **Search** across every lecture title, topic, note and flashcard
- **Resources** — link slides, recordings, problem sets, or host files yourself
- **Flashcards** — click to flip, reveal all, shuffle
- **Quiz me** — cross-course flashcard drilling; cards answered wrong come back
  about six times as often as mastered ones
- **Progress** — mark lectures reviewed; progress bars update everywhere
- **Resume** — the dashboard offers the lecture he was last reading, or the
  next unreviewed one
- **Two themes** — dark and light, switched from the menu and remembered
- **Phone-friendly** — collapsible menu, swipe between lectures
- **Prints cleanly** — flashcard answers are revealed in print output
- **No CDN, no tracking, no external requests**

## Progress data

Reviewed/unreviewed state lives in the browser's local storage under the key
`lecturehub.v1`. It's per-browser and per-device, and it isn't in the repo — so
nothing personal gets published. Clearing site data resets it.

## Publishing

The site is fully static, so any host works. For GitHub Pages:

```bash
git init
git add .
git commit -m "Lecture Hub"
git branch -M main
git remote add origin git@github.com:<username>/<repo>.git
git push -u origin main
```

Then in the repository: **Settings → Pages → Source: `main` / root**.

`.nojekyll` is included so GitHub serves the files as-is.

Remember to commit `assets/js/content.js` — the published site needs it, since
there is no build step on the server.

## Changing the look

Everything visual is in `assets/css/styles.css`, in the CSS variables at the
top. To change the default theme, edit `<html data-theme="dark">` to
`data-theme="light"` in the three HTML files.
