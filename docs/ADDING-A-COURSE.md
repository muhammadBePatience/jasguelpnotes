---
title: Adding a course
order: 3
summary: Two steps to add a new subject, plus publishing it to the live site
---

# Adding a course

Two steps. Say you're adding Physics.

## 1. List the course

Open `data/courses.json` and add a block to the `courses` list:

```json
{
  "id": "phys121",
  "code": "PHYS 121",
  "name": "Mechanics",
  "instructor": "Dr. S. Patel",
  "term": "Fall 2026"
}
```

Remember the comma between blocks — a missing one is the single most common
reason the build complains.

| Field | What it's for |
|---|---|
| `id` | The folder name. Lowercase, no spaces. Never change it later |
| `code` | Shown in the sidebar and on cards, e.g. `PHYS 121` |
| `name` | The full subject name |
| `instructor` | Optional |
| `term` | Optional |

## 2. Make the matching folder

```bash
mkdir -p data/lectures/phys121
```

**The folder name must match the `id` exactly.** That's the only rule that
really matters here — if a course shows up empty, this is almost always why.

Then add lectures to it (see *Adding a lecture*) and rebuild:

```bash
node build.js
```

Courses appear in the order they're listed in the JSON, so rearrange that list
to rearrange the sidebar.

## Publishing it

Rebuilding only updates your own computer. To get it onto the live site:

```bash
node build.js
git add -A
git commit -m "Added PHYS 121"
git push
```

The live site updates about 30 seconds after the push.

Run `node build.js` **before** committing. If you skip it, the push succeeds,
the deploy succeeds, and the site quietly keeps showing the old content —
which looks like a bug but is just a stale build.

## Renaming and deleting

- **Renaming a lecture file** breaks its link and loses its "reviewed" mark,
  because the file name is what identifies it. Avoid it once a term is running.
- **Deleting a course** means removing its block from `courses.json` *and* its
  folder. Leaving the folder behind is harmless — nothing reads it.
- **Changing a course's `id`** is effectively deleting it and making a new one.
  Change the `code` or `name` instead; those are free to edit any time.
