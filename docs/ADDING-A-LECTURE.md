---
title: Adding a lecture
order: 2
summary: The three steps, the file format, and what each section does
---

# Adding a lecture

Three steps, every time.

1. Create a markdown file in `data/lectures/<course-id>/`
2. Run `node build.js`
3. Refresh the page

Copy `docs/_TEMPLATE.md` as your starting point.

---

## The file name matters

`data/lectures/cs240/week-04-hash-tables.md`

- It goes in the folder named after the course `id` from `data/courses.json`.
- The file name (minus `.md`) becomes the lecture's permanent link. Keep it
  lowercase with hyphens, and don't rename it later — bookmarks and saved
  progress are tied to it.

## The file format

```markdown
---
title: Hash Tables
week: 4
date: 2026-09-29
summary: Chaining, open addressing and the load factor
topics: [hashing, collisions]
---

## Notes

Ordinary markdown. Headings, **bold**, *italic*, `code`, links, lists,
> blockquotes, tables and fenced code blocks all work.

## Resources

- [Lecture slides (PDF)](https://example.com/slides.pdf)
- [Recording](https://example.com/recording)
- [Local file](files/cs240/week-04.pdf)

## Flashcards

Q: Why resize a hash table?
A: To keep the load factor low so expected lookup stays O(1).

Q: Chaining vs open addressing?
A: Chaining stores collisions in a list per bucket; open addressing probes for the next free slot.
```

### Frontmatter fields

| Field | Required | Notes |
|---|---|---|
| `title` | recommended | Falls back to the file name |
| `week` | recommended | A number. Controls the ordering |
| `date` | optional | Shown under the title |
| `summary` | optional | The one-line description in lists |
| `topics` | optional | `[a, b, c]` — shown as small tags |

### Section rules

- `## Notes` — free markdown. This is the body of the page.
- `## Resources` — **only** lines of the form `- [Label](url)` are picked up.
- `## Flashcards` — alternating `Q:` and `A:` lines. One card per pair.

All three sections are optional. If you skip `## Notes` entirely, any text
before the first `##` heading is used as the notes instead.

## Attaching files instead of links

Put PDFs and slides in a `files/` folder at the root of the site, then link to
them with a relative path:

```markdown
- [Slides](files/cs240/week-04.pdf)
```

They'll be published along with the site.

## Adding a whole new course

1. Add an entry to `courses` in `data/courses.json`:

   ```json
   {
     "id": "phys121",
     "code": "PHYS 121",
     "name": "Mechanics",
     "instructor": "Dr. S. Patel",
     "term": "Fall 2026"
   }
   ```

2. Create the folder `data/lectures/phys121/`
3. Add lecture files, run `node build.js`

## Troubleshooting

**"Nothing changed after I edited a file."**
You didn't run `node build.js`, or the browser cached the old file — hard-reload
with Cmd+Shift+R.

**"The page is blank."**
Open the browser console (Cmd+Option+J). A syntax error in `data/courses.json`
is the usual cause — the build prints the line number.

**"My flashcards didn't appear."**
The `Q:` and `A:` prefixes must start the line, and each `Q:` needs an `A:`
after it.
