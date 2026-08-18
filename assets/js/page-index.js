/* ==========================================================================
   page-index.js — the dashboard: resume, every course, overall progress,
   and search across everything.
   ========================================================================== */

(function () {
  const { $, esc, courses, course, lecture, courseProgress, flashcardCount,
    renderSidebar, initChrome, nextUnreviewed } = App;

  renderSidebar(null);
  initChrome();

  const site = App.CONTENT.site || {};

  /* ---------- welcome banner ----------
     The name comes from "student" in data/courses.json — change it there. */
  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  $('#crumb').textContent = site.term || '';

  if (site.student) {
    $('#title').innerHTML = `Welcome, ${esc(site.student)}`;
    $('#sub').textContent = `${greeting()} — ${site.tagline || 'everything is here and ready.'}`;
  } else {
    $('#title').textContent = site.title || 'Lecture Hub';
    $('#sub').textContent = site.tagline || 'All courses in one place.';
  }

  /* ---------- pick up where he left off ---------- */
  function renderResume() {
    const box = $('#resume');
    const last = Store.lastVisit();

    // Prefer the lecture he was actually reading, as long as it still exists.
    let target = null;
    let label = '';

    if (last) {
      const c = course(last.courseId);
      const l = lecture(c, last.lectureId);
      if (c && l && !Store.isReviewed(c.id, l.id)) {
        target = { c, l };
        label = 'Continue where you left off';
      }
    }

    if (!target) {
      const next = nextUnreviewed();
      if (next) { target = { c: next.course, l: next.lecture }; label = 'Next up'; }
    }

    if (!target) { box.innerHTML = ''; return; }

    box.innerHTML = `
      <a class="resume" href="lecture.html?c=${encodeURIComponent(target.c.id)}&l=${encodeURIComponent(target.l.id)}">
        <span class="icon">▸</span>
        <span class="txt">
          <small>${esc(label)}</small>
          <b>${esc(target.l.title)}</b>
          <span>${esc(target.c.code)} · ${esc(target.l.weekLabel || '')}</span>
        </span>
        <span class="go">→</span>
      </a>`;
  }

  /* ---------- overall stats ---------- */
  function renderStats() {
    const all = courses();
    const totals = all.reduce((acc, c) => {
      const p = courseProgress(c);
      acc.lectures += p.total;
      acc.done += p.done;
      acc.cards += flashcardCount(c);
      return acc;
    }, { lectures: 0, done: 0, cards: 0 });

    const pct = totals.lectures ? Math.round((totals.done / totals.lectures) * 100) : 0;

    $('#stats').innerHTML = [
      [all.length, 'Courses'],
      [totals.lectures, 'Lectures'],
      [totals.lectures - totals.done, 'To review'],
      [pct + '%', 'Reviewed'],
      [totals.cards, 'Flashcards']
    ].map(([v, k]) => `<div class="stat"><b>${esc(v)}</b><span>${esc(k)}</span></div>`).join('');
  }

  /* ---------- course cards ---------- */
  function renderCourses() {
    const all = courses();
    if (!all.length) {
      $('#courses').innerHTML = `<div class="empty">
        No courses yet. Add one to <code>data/courses.json</code>, drop a markdown
        file in <code>data/lectures/&lt;course-id&gt;/</code>, then run <code>node build.js</code>.
      </div>`;
      return;
    }
    $('#courses').innerHTML = '<div class="grid">' + all.map((c) => {
      const p = courseProgress(c);
      return `<a class="card-link" href="course.html?c=${encodeURIComponent(c.id)}">
        <span class="code">${esc(c.code)}</span>
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.instructor || '')}</p>
        <div class="bar" style="margin-top:14px"><i style="width:${p.pct}%"></i></div>
        <div class="card-foot"><span>${p.done} / ${p.total} reviewed</span><span>${p.pct}%</span></div>
      </a>`;
    }).join('') + '</div>';
  }

  /* ---------- global search across all lectures ---------- */
  function renderSearch(q) {
    const box = $('#results');
    const hide = (on) => {
      $('#courses').style.display = on ? 'none' : '';
      $('#resume').style.display = on ? 'none' : '';
      $('#stats').style.display = on ? 'none' : '';
    };

    if (!q) { box.innerHTML = ''; hide(false); return; }
    hide(true);

    const hits = [];
    courses().forEach((c) => {
      (c.lectures || []).forEach((l) => {
        if (l.searchText.includes(q)) hits.push({ c, l });
      });
    });

    if (!hits.length) {
      box.innerHTML = `<div class="empty">Nothing matches “${esc(q)}”.</div>`;
      return;
    }

    box.innerHTML = `<p class="page-sub">${hits.length} lecture${hits.length === 1 ? '' : 's'} matching “${esc(q)}”</p>`
      + hits.map(({ c, l }) => {
        const done = Store.isReviewed(c.id, l.id);
        return `<a class="lecture-row" href="lecture.html?c=${encodeURIComponent(c.id)}&l=${encodeURIComponent(l.id)}">
          <span class="wk">${esc(c.code)}</span>
          <span class="meta"><b>${esc(l.title)}</b><span>${esc(l.summary || '')}</span></span>
          <span class="tag ${done ? 'done' : 'todo'}">${done ? 'Reviewed' : 'To review'}</span>
        </a>`;
      }).join('');
  }

  $('#search').addEventListener('input', (e) => {
    renderSearch(e.target.value.trim().toLowerCase());
  });

  renderResume();
  renderStats();
  renderCourses();
})();
