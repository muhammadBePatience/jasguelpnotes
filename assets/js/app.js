/* ==========================================================================
   app.js — shared helpers used by every page: the sidebar, the mobile drawer,
   the theme toggle, and service-worker registration.
   Reads window.CONTENT, which build.js generates from the data/ folder.
   ========================================================================== */

const App = (() => {
  const CONTENT = window.CONTENT || { site: {}, courses: [] };

  /* ---------- tiny helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const param = (name) => new URLSearchParams(location.search).get(name);

  /* ---------- data access ---------- */
  const courses = () => CONTENT.courses || [];
  const course = (id) => courses().find((c) => c.id === id) || null;
  const lecture = (c, id) => (c ? (c.lectures || []).find((l) => l.id === id) || null : null);

  function courseProgress(c) {
    const ids = (c.lectures || []).map((l) => l.id);
    const done = Store.reviewedCount(c.id, ids);
    return { total: ids.length, done, pct: ids.length ? Math.round((done / ids.length) * 100) : 0 };
  }

  function flashcardCount(c) {
    return (c.lectures || []).reduce((sum, l) => sum + (l.flashcards ? l.flashcards.length : 0), 0);
  }

  /** Every flashcard in the site, flattened, with its stable key. */
  function allCards() {
    const out = [];
    courses().forEach((c) => {
      (c.lectures || []).forEach((l) => {
        (l.flashcards || []).forEach((f, i) => {
          out.push({
            key: Store.cardKey(c.id, l.id, i),
            q: f.q, a: f.a,
            courseId: c.id, courseCode: c.code,
            lectureId: l.id, lectureTitle: l.title
          });
        });
      });
    });
    return out;
  }

  /** The next lecture he hasn't marked reviewed, scanning courses in order. */
  function nextUnreviewed() {
    for (const c of courses()) {
      for (const l of (c.lectures || [])) {
        if (!Store.isReviewed(c.id, l.id)) return { course: c, lecture: l };
      }
    }
    return null;
  }

  /* ---------- theme ---------- */
  function applyTheme(name) {
    document.documentElement.setAttribute('data-theme', name);
    Store.setTheme(name);
    const btn = $('#themeToggle');
    if (btn) btn.textContent = name === 'dark' ? '☀  Switch to light' : '☾  Switch to dark';
  }

  function toggleTheme() {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  }

  /* ---------- sidebar + mobile drawer ---------- */
  function renderSidebar(activeCourseId) {
    const el = $('#sidebar');
    if (!el) return;

    const links = courses().map((c) => {
      const p = courseProgress(c);
      return `
        <a class="course-link ${c.id === activeCourseId ? 'active' : ''}" href="course.html?c=${encodeURIComponent(c.id)}">
          <span class="code">${esc(c.code)}</span>${esc(c.name)}
          <div class="bar" title="${p.done} of ${p.total} reviewed"><i style="width:${p.pct}%"></i></div>
        </a>`;
    }).join('');

    el.innerHTML = `
      <a class="brand" href="index.html">
        <span class="dot"></span>
        <span><b>${esc(CONTENT.site.title || 'Lecture Hub')}</b>
        <small>${esc(CONTENT.site.student || CONTENT.site.owner || '')}</small></span>
      </a>
      <a class="quiz-cta" href="quiz.html">⚡  Quiz me</a>
      <div class="side-label">${esc(CONTENT.site.term || 'Courses')}</div>
      ${links || '<div class="empty" style="padding:16px;font-size:13px">No courses yet</div>'}
      <div class="side-foot">
        <a class="side-link" href="help.html">?  How to add lectures</a>
        <button class="theme-toggle" id="themeToggle" type="button">Theme</button>
        <div class="offline-note" id="offlineNote" hidden>Offline — showing your saved copy</div>
      </div>`;

    $('#themeToggle').addEventListener('click', toggleTheme);
    applyTheme(Store.getTheme() || document.documentElement.getAttribute('data-theme') || 'dark');

    // close the drawer whenever a link inside it is followed
    $$('a', el).forEach((a) => a.addEventListener('click', closeDrawer));
  }

  /* The sidebar becomes an off-canvas drawer under 820px. */
  function openDrawer() {
    document.body.classList.add('drawer-open');
    const s = $('#scrim'); if (s) s.hidden = false;
  }
  function closeDrawer() {
    document.body.classList.remove('drawer-open');
    const s = $('#scrim'); if (s) s.hidden = true;
  }

  function initChrome() {
    const menu = $('#menuBtn');
    if (menu) menu.addEventListener('click', () => {
      document.body.classList.contains('drawer-open') ? closeDrawer() : openDrawer();
    });
    const scrim = $('#scrim');
    if (scrim) scrim.addEventListener('click', closeDrawer);

    const topTheme = $('#topThemeBtn');
    if (topTheme) topTheme.addEventListener('click', toggleTheme);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });

    // show a quiet note in the sidebar when there's no connection
    const note = () => { const n = $('#offlineNote'); if (n) n.hidden = navigator.onLine; };
    window.addEventListener('online', note);
    window.addEventListener('offline', note);
    setTimeout(note, 0);
  }

  /* ---------- offline support ---------- */
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ });
    });
  }

  /* ---------- swipe between lectures (phones) ---------- */
  function enableSwipe(onLeft, onRight) {
    let x0 = null, y0 = null;
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) { x0 = null; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', (e) => {
      if (x0 === null || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx)) return; // ignore scrolls
      (dx < 0 ? onLeft : onRight)();
    }, { passive: true });
  }

  registerServiceWorker();

  return {
    $, $$, esc, param, CONTENT,
    courses, course, lecture, courseProgress, flashcardCount, allCards, nextUnreviewed,
    renderSidebar, initChrome, applyTheme, toggleTheme, closeDrawer, enableSwipe
  };
})();
