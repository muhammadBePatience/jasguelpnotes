#!/usr/bin/env node
/* ==========================================================================
   build.js — turns the data/ folder into assets/js/content.js
   ---------------------------------------------------------------------------
   Run it after adding or editing a lecture:

       node build.js

   No dependencies, no npm install. Node 16+ is all you need.

   It reads:
     data/courses.json                  — the list of courses
     data/lectures/<course-id>/*.md     — one markdown file per lecture

   It writes:
     assets/js/content.js               — a single generated file (do not edit)
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const OUT = path.join(ROOT, 'assets', 'js', 'content.js');

/* ==========================================================================
   1. A very small markdown renderer
   Supports: headings, bold, italic, inline code, fenced code blocks, links,
   bullet and numbered lists, blockquotes, horizontal rules, paragraphs.
   That covers ordinary lecture notes. Anything fancier, write raw HTML — it
   passes through untouched.
   ========================================================================== */

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s) {
  return s
    .replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2" style="max-width:100%">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
}

function markdown(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  let listType = null;

  const closeList = () => { if (listType) { out.push(`</${listType}>`); listType = null; } };

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block — may be indented, e.g. nested inside a list item
    const fence = line.match(/^(\s*)```(.*)$/);
    if (fence) {
      closeList();
      const indent = fence[1].length;
      const lang = fence[2].trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      // strip the indentation the fence itself was written at
      const body = buf.map((s) => (s.slice(0, indent).trim() === '' ? s.slice(indent) : s));
      out.push(`<pre><code${lang ? ` class="lang-${lang}"` : ''}>${escapeHtml(body.join('\n'))}</code></pre>`);
      continue;
    }

    // blank line
    if (!line.trim()) { closeList(); i++; continue; }

    // heading — `#` and `##` are clamped to h2 so they never compete with the
    // page title; `###` and deeper map straight through.
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { closeList(); const n = Math.min(Math.max(h[1].length, 2), 6); out.push(`<h${n}>${inline(h[2])}</h${n}>`); i++; continue; }

    // table:  | a | b |
    //         |---|---|
    //         | 1 | 2 |
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      closeList();
      const cells = (row) => row.trim().replace(/^\||\|$/g, '').split('|').map((s) => s.trim());
      const head = cells(line);
      i += 2;
      const body = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { body.push(cells(lines[i])); i++; }
      out.push('<table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>' +
        body.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
        '</tbody></table>');
      continue;
    }

    // horizontal rule
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) { closeList(); out.push('<hr>'); i++; continue; }

    // blockquote
    if (/^>\s?/.test(line)) {
      closeList();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      out.push(`<blockquote>${markdown(buf.join('\n'))}</blockquote>`);
      continue;
    }

    /* A list item can wrap onto following lines in markdown ("lazy
       continuation"). Without this, a bullet that spans two source lines
       renders as a bullet plus a stray paragraph. */
    const startsNewBlock = (s) =>
      !s.trim() || /^(#{1,6}\s|\s*```|>|\s*\||\s*[-*+]\s|\s*\d+[.)]\s)/.test(s);

    const continuation = () => {
      const parts = [];
      while (i + 1 < lines.length && !startsNewBlock(lines[i + 1])) {
        parts.push(lines[i + 1].trim());
        i++;
      }
      return parts.length ? ' ' + parts.join(' ') : '';
    };

    // bullet list
    const ul = line.match(/^\s*[-*+]\s+(.*)$/);
    if (ul) {
      if (listType !== 'ul') { closeList(); out.push('<ul>'); listType = 'ul'; }
      out.push(`<li>${inline(ul[1] + continuation())}</li>`);
      i++; continue;
    }

    // numbered list. The number written in the markdown becomes the list's
    // start value, so a list interrupted by a code block carries on counting
    // instead of restarting at 1.
    const ol = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (ol) {
      if (listType !== 'ol') {
        closeList();
        const start = parseInt(ol[1], 10);
        out.push(start > 1 ? `<ol start="${start}">` : '<ol>');
        listType = 'ol';
      }
      out.push(`<li>${inline(ol[2] + continuation())}</li>`);
      i++; continue;
    }

    // raw html passthrough
    if (/^\s*<[a-zA-Z!/]/.test(line)) { closeList(); out.push(line); i++; continue; }

    // paragraph (collect until blank line)
    closeList();
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|>|\s*\||\s*[-*+]\s|\s*\d+[.)]\s)/.test(lines[i])) {
      para.push(lines[i].trim()); i++;
    }
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }

  closeList();
  return out.join('\n');
}

/* ==========================================================================
   2. Frontmatter parser (a small YAML subset: key: value, and [a, b] lists)
   ========================================================================== */

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  m[1].split('\n').forEach((line) => {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) return;
    let value = kv[2].trim();
    if (/^\[.*\]$/.test(value)) {
      value = value.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      value = value.replace(/^["']|["']$/g, '');
    }
    meta[kv[1]] = value;
  });
  return { meta, body: text.slice(m[0].length) };
}

/* ==========================================================================
   3. Split the body into its named sections (## Notes, ## Resources, …)
   ========================================================================== */

function splitSections(body) {
  const sections = { _intro: [] };
  let current = '_intro';
  body.replace(/\r\n/g, '\n').split('\n').forEach((line) => {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) {
      current = h[1].trim().toLowerCase();
      sections[current] = [];
    } else {
      (sections[current] = sections[current] || []).push(line);
    }
  });
  Object.keys(sections).forEach((k) => { sections[k] = sections[k].join('\n').trim(); });
  return sections;
}

function parseResources(text) {
  if (!text) return [];
  const out = [];
  text.split('\n').forEach((line) => {
    const m = line.match(/^\s*[-*+]\s*\[([^\]]+)\]\(([^)\s]+)\)\s*$/);
    if (m) out.push({ label: m[1].trim(), url: m[2].trim() });
  });
  return out;
}

function parseFlashcards(text) {
  if (!text) return [];
  const out = [];
  let q = null;
  text.split('\n').forEach((line) => {
    const qm = line.match(/^\s*Q:\s*(.*)$/i);
    const am = line.match(/^\s*A:\s*(.*)$/i);
    if (qm) { q = qm[1].trim(); return; }
    if (am && q) { out.push({ q, a: am[1].trim() }); q = null; }
  });
  return out;
}

/* ==========================================================================
   4. Build
   ========================================================================== */

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function readCourses() {
  const file = path.join(DATA, 'courses.json');
  if (!fs.existsSync(file)) {
    console.error('✗ Missing data/courses.json');
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.error('✗ data/courses.json is not valid JSON:', e.message);
    process.exit(1);
  }
}

/* --------------------------------------------------------------------------
   The guides in docs/ are compiled into the site too, so they can be read on
   the Help page from a phone — no need to go digging through GitHub.
   Files starting with _ are skipped (they're templates, not guides).
   -------------------------------------------------------------------------- */

function readGuides() {
  const dir = path.join(ROOT, 'docs');
  if (!fs.existsSync(dir)) return [];

  const guides = fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const { meta, body } = parseFrontmatter(raw);
      const id = f.replace(/\.md$/, '');

      // Fall back to the first "# Heading" for the title, then the file name.
      const firstHeading = (body.match(/^#\s+(.+)$/m) || [])[1];
      const title = meta.title || firstHeading ||
        id.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      // Drop that leading H1 — the page shows the title itself.
      const trimmed = body.replace(/^#\s+.+$/m, '');

      return {
        id,
        title,
        summary: meta.summary || '',
        order: meta.order ? parseInt(meta.order, 10) : 99,
        html: markdown(trimmed)
      };
    });

  guides.sort((a, b) => (a.order - b.order) || a.title.localeCompare(b.title));
  console.log(`  ✓ guides: ${guides.length} (${guides.map((g) => g.title).join(', ')})`);
  return guides;
}

/* The lecture template, kept raw so the Help page can offer it to copy. */
function readTemplate() {
  const file = path.join(ROOT, 'docs', '_TEMPLATE.md');
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

/* --------------------------------------------------------------------------
   Stamp sw.js with a fresh version and the exact list of files to cache.
   The version changes whenever the content does, which is what tells an
   already-installed copy on a phone to pull down the new lectures.
   -------------------------------------------------------------------------- */

function listCacheable() {
  const skip = new Set(['data', 'docs', 'node_modules', '.git']);
  const out = [];

  (function walk(dir, rel) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    entries.forEach((e) => {
      // dotfiles and _scratch files are never part of the published site
      if (e.name.startsWith('.') || e.name.startsWith('_')) return;
      const relPath = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) {
        if (skip.has(e.name) || rel === '' && skip.has(relPath)) return;
        walk(path.join(dir, e.name), relPath);
      } else {
        // sw.js must never cache itself, and build.js isn't served
        if (relPath === 'sw.js' || relPath === 'build.js') return;
        if (/\.(md|log)$/i.test(relPath) && !relPath.startsWith('files/')) return;
        out.push(relPath);
      }
    });
  })(ROOT, '');

  return ['./'].concat(out.sort());
}

function writeServiceWorker(payload) {
  const swPath = path.join(ROOT, 'sw.js');
  if (!fs.existsSync(swPath)) return;

  // A short hash of everything that ships, so the version moves whenever any
  // of it changes — courses, lectures, guides, site settings. Miss one and an
  // already-installed phone keeps serving the old copy from its cache.
  // builtAt is excluded on purpose: it changes every run and would force a
  // pointless re-download on every build.
  const { builtAt, ...content } = payload;
  const stamp = require('crypto').createHash('sha1')
    .update(JSON.stringify(content))
    .digest('hex').slice(0, 8);

  const files = listCacheable();
  let sw = fs.readFileSync(swPath, 'utf8');

  sw = sw.replace(
    /\/\* BUILD:VERSION \*\/[\s\S]*?\/\* \/BUILD:VERSION \*\//,
    `/* BUILD:VERSION */\nconst VERSION = '${stamp}';\n/* /BUILD:VERSION */`
  );

  sw = sw.replace(
    /\/\* BUILD:PRECACHE \*\/[\s\S]*?\/\* \/BUILD:PRECACHE \*\//,
    `/* BUILD:PRECACHE */\nconst PRECACHE = ${JSON.stringify(files, null, 2)};\n/* /BUILD:PRECACHE */`
  );

  fs.writeFileSync(swPath, sw, 'utf8');
  console.log(`  ✓ offline cache: ${files.length} files, version ${stamp}`);
}

function build() {
  const config = readCourses();
  const site = config.site || {};
  const courses = (config.courses || []).map((course) => {
    const dir = path.join(DATA, 'lectures', course.id);
    let files = [];
    if (fs.existsSync(dir)) {
      files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
    } else {
      console.warn(`  ! no folder data/lectures/${course.id} — course will show as empty`);
    }

    const lectures = files.map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const { meta, body } = parseFrontmatter(raw);
      const sections = splitSections(body);

      const notesSource = sections['notes'] || sections['_intro'] || '';
      const notesHtml = notesSource ? markdown(notesSource) : '';
      const resources = parseResources(sections['resources']);
      const flashcards = parseFlashcards(sections['flashcards']);
      const topics = Array.isArray(meta.topics) ? meta.topics : (meta.topics ? [meta.topics] : []);
      const week = meta.week ? String(meta.week) : '';

      const id = file.replace(/\.md$/, '');
      const title = meta.title || id.replace(/[-_]/g, ' ');

      return {
        id,
        title,
        summary: meta.summary || '',
        date: meta.date || '',
        week,
        weekLabel: week ? `Week ${week}` : '',
        topics,
        notesHtml,
        resources,
        flashcards,
        searchText: [title, meta.summary, topics.join(' '), stripTags(notesHtml),
          flashcards.map((f) => f.q + ' ' + f.a).join(' ')].filter(Boolean).join(' ').toLowerCase()
      };
    });

    // sort by week number when present, otherwise by filename
    lectures.sort((a, b) => {
      const aw = parseInt(a.week, 10);
      const bw = parseInt(b.week, 10);
      if (!isNaN(aw) && !isNaN(bw) && aw !== bw) return aw - bw;
      return a.id.localeCompare(b.id);
    });

    console.log(`  ✓ ${course.code.padEnd(10)} ${String(lectures.length).padStart(2)} lecture(s), ` +
      `${lectures.reduce((s, l) => s + l.flashcards.length, 0)} flashcard(s)`);

    return Object.assign({}, course, { lectures });
  });

  const guides = readGuides();
  const template = readTemplate();

  const payload = { site, courses, guides, template, builtAt: new Date().toISOString() };
  writeServiceWorker(payload);
  const js = '/* GENERATED BY build.js — DO NOT EDIT.\n' +
    '   Edit data/courses.json and data/lectures/**.md, then run: node build.js */\n' +
    'window.CONTENT = ' + JSON.stringify(payload, null, 2) + ';\n';

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, js, 'utf8');

  const total = courses.reduce((s, c) => s + c.lectures.length, 0);
  console.log(`\n✓ Built ${courses.length} course(s), ${total} lecture(s) → assets/js/content.js`);
}

console.log('Building Lecture Hub…\n');
build();
