/* ==========================================================================
   page-course.js — one course: its lectures, filters, progress
   ========================================================================== */

(function () {
  const { $, $$, esc, param, course, courseProgress, flashcardCount, renderSidebar, initChrome } = App;

  const courseId = param('c');
  const c = course(courseId);

  renderSidebar(courseId);
  initChrome();

  if (!c) {
    $('#title').textContent = 'Course not found';
    $('#sub').textContent = 'Check the link, or pick a course from the sidebar.';
    $('#lectures').innerHTML = '<div class="empty">No course with that id.</div>';
    $('.toolbar').style.display = 'none';
    return;
  }

  document.title = c.code + ' — Lecture Hub';
  const top = $('#topTitle'); if (top) top.textContent = c.code;
  $('#crumb').innerHTML = `<a href="index.html">All courses</a> · ${esc(c.term || '')}`;
  $('#title').textContent = c.name;
  $('#sub').textContent = [c.code, c.instructor, (c.lectures || []).length + ' lectures']
    .filter(Boolean).join(' · ');

  let filter = 'all';
  let query = '';

  function renderStats() {
    const p = courseProgress(c);
    $('#stats').innerHTML = [
      [p.total, 'Lectures'],
      [p.done, 'Reviewed'],
      [p.total - p.done, 'To review'],
      [p.pct + '%', 'Progress'],
      [flashcardCount(c), 'Flashcards']
    ].map(([v, k]) => `<div class="stat"><b>${esc(v)}</b><span>${esc(k)}</span></div>`).join('');
  }

  function renderLectures() {
    const items = (c.lectures || []).filter((l) => {
      const done = Store.isReviewed(c.id, l.id);
      if (filter === 'done' && !done) return false;
      if (filter === 'todo' && done) return false;
      if (query && !l.searchText.includes(query)) return false;
      return true;
    });

    if (!items.length) {
      $('#lectures').innerHTML = `<div class="empty">
        Nothing here yet. Add a markdown file to
        <code>data/lectures/${esc(c.id)}/</code> and run <code>node build.js</code>.
      </div>`;
      return;
    }

    $('#lectures').innerHTML = items.map((l) => {
      const done = Store.isReviewed(c.id, l.id);
      return `<a class="lecture-row" href="lecture.html?c=${encodeURIComponent(c.id)}&l=${encodeURIComponent(l.id)}">
        <span class="wk">${esc(l.weekLabel)}</span>
        <span class="meta"><b>${esc(l.title)}</b><span>${esc(l.summary || '')}</span></span>
        <span class="tag ${done ? 'done' : 'todo'}">${done ? 'Reviewed' : 'To review'}</span>
      </a>`;
    }).join('');
  }

  $('#search').addEventListener('input', (e) => {
    query = e.target.value.trim().toLowerCase();
    renderLectures();
  });

  $$('.chip').forEach((b) => b.addEventListener('click', () => {
    $$('.chip').forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
    filter = b.dataset.filter;
    renderLectures();
  }));

  renderStats();
  renderLectures();
})();
