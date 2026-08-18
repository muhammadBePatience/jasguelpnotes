/* ==========================================================================
   page-lecture.js — a single lecture: notes, resources, flashcards, progress
   ========================================================================== */

(function () {
  const { $, $$, esc, param, course, lecture, renderSidebar, initChrome, enableSwipe } = App;

  const courseId = param('c');
  const lectureId = param('l');
  const c = course(courseId);
  const l = lecture(c, lectureId);

  renderSidebar(courseId);
  initChrome();

  if (!c || !l) {
    $('#title').textContent = 'Lecture not found';
    $('#sub').textContent = 'Check the link, or pick a course from the sidebar.';
    $('#reviewBtn').style.display = 'none';
    $('#body').innerHTML = '<div class="empty">No lecture with that id.</div>';
    return;
  }

  // remember this as the place to resume from
  Store.recordVisit(c.id, l.id);

  document.title = l.title + ' — ' + c.code;
  const top = $('#topTitle'); if (top) top.textContent = c.code;
  $('#crumb').innerHTML =
    `<a href="index.html">All courses</a> · <a href="course.html?c=${encodeURIComponent(c.id)}">${esc(c.code)}</a> · ${esc(l.weekLabel)}`;
  $('#title').textContent = l.title;
  $('#sub').textContent = [l.summary, l.date].filter(Boolean).join(' · ');

  if (l.topics && l.topics.length) {
    $('#topics').innerHTML = l.topics.map((t) => `<span class="topic">${esc(t)}</span>`).join('');
  }

  /* ---------- reviewed toggle ---------- */
  const btn = $('#reviewBtn');
  function paintBtn() {
    const done = Store.isReviewed(c.id, l.id);
    btn.textContent = done ? '✓  Reviewed — click to undo' : 'Mark as reviewed';
    btn.classList.toggle('primary', !done);
  }
  btn.addEventListener('click', () => { Store.toggleReviewed(c.id, l.id); paintBtn(); });
  paintBtn();

  /* ---------- body: notes, resources, flashcards ---------- */
  const parts = [];

  if (l.notesHtml && l.notesHtml.trim()) {
    parts.push(`<section class="section"><h2>Notes</h2><div class="prose">${l.notesHtml}</div></section>`);
  }

  if (l.resources && l.resources.length) {
    parts.push(`<section class="section"><h2>Resources</h2><div class="resources">` +
      l.resources.map((r) => {
        const external = /^https?:/i.test(r.url);
        return `<a href="${esc(r.url)}"${external ? ' target="_blank" rel="noopener"' : ''}>${esc(r.label)}</a>`;
      }).join('') + `</div></section>`);
  }

  if (l.flashcards && l.flashcards.length) {
    parts.push(`<section class="section">
      <h2>Flashcards — ${l.flashcards.length}</h2>
      <div style="margin-bottom:10px">
        <button class="btn" id="flipAll" type="button">Reveal all</button>
        <button class="btn" id="shuffle" type="button">Shuffle</button>
      </div>
      <div class="cards" id="cards">` +
      l.flashcards.map((f) => `<div class="flashcard">
          <div class="q">${esc(f.q)}</div>
          <div class="a">${esc(f.a)}</div>
          <div class="hint">click to reveal</div>
        </div>`).join('') + `</div></section>`);
  }

  if (!parts.length) {
    parts.push(`<div class="empty">This lecture has no content yet — add notes to its markdown file and rebuild.</div>`);
  }

  $('#body').innerHTML = parts.join('');

  $$('.flashcard').forEach((k) => k.addEventListener('click', () => k.classList.toggle('flipped')));

  const flipAll = $('#flipAll');
  if (flipAll) {
    flipAll.addEventListener('click', () => {
      const anyHidden = $$('.flashcard').some((k) => !k.classList.contains('flipped'));
      $$('.flashcard').forEach((k) => k.classList.toggle('flipped', anyHidden));
      flipAll.textContent = anyHidden ? 'Hide all' : 'Reveal all';
    });
  }

  const shuffle = $('#shuffle');
  if (shuffle) {
    shuffle.addEventListener('click', () => {
      const box = $('#cards');
      const kids = $$('.flashcard', box);
      for (let i = kids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        box.appendChild(kids[j]);
        kids.splice(j, 1);
      }
      $$('.flashcard').forEach((k) => k.classList.remove('flipped'));
    });
  }

  /* ---------- prev / next ---------- */
  const list = c.lectures || [];
  const i = list.findIndex((x) => x.id === l.id);
  const prev = i > 0 ? list[i - 1] : null;
  const next = i > -1 && i < list.length - 1 ? list[i + 1] : null;

  const href = (x) => `lecture.html?c=${encodeURIComponent(c.id)}&l=${encodeURIComponent(x.id)}`;

  $('#pager').innerHTML =
    (prev ? `<a class="btn" href="${href(prev)}">←  ${esc(prev.title)}</a>` : '<span></span>') +
    (next ? `<a class="btn" href="${href(next)}">${esc(next.title)}  →</a>` : '<span></span>');

  const goPrev = () => { if (prev) location.href = href(prev); };
  const goNext = () => { if (next) location.href = href(next); };

  /* Arrow keys on a laptop, swipe on a phone. Swipe left = forward, the same
     direction as turning a page. */
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowLeft') goPrev();
    else if (e.key === 'ArrowRight') goNext();
  });

  enableSwipe(goNext, goPrev);
})();
