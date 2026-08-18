/* ==========================================================================
   page-quiz.js — flashcards from across every course, one at a time.
   ---------------------------------------------------------------------------
   Cards are picked at weighted random rather than in order: anything answered
   wrong last time comes back roughly six times as often as something already
   mastered, and cards never seen sit in between. There's no "end" — it keeps
   going until he stops, which suits a bus ride of unknown length.
   ========================================================================== */

(function () {
  const { $, $$, esc, allCards, courses, renderSidebar, initChrome } = App;

  renderSidebar(null);
  initChrome();

  const every = allCards();
  let filter = 'all';           // 'all' or a courseId
  let current = null;
  let lastKey = null;
  let revealed = false;
  let session = { asked: 0, right: 0 };

  /* ---------- which cards are in play ---------- */
  function pool() {
    return filter === 'all' ? every : every.filter((c) => c.courseId === filter);
  }

  /* ---------- header ---------- */
  function renderStats() {
    const keys = pool().map((c) => c.key);
    const s = Store.quizSummary(keys);
    $('#stats').innerHTML = [
      [s.total, 'In this deck'],
      [s.weak, 'Needs work'],
      [s.unseen, 'New'],
      [s.mastered, 'Mastered'],
      [session.asked ? Math.round((session.right / session.asked) * 100) + '%' : '—', 'This session']
    ].map(([v, k]) => `<div class="stat"><b>${esc(v)}</b><span>${esc(k)}</span></div>`).join('');
  }

  function renderFilters() {
    const opts = [['all', 'All courses']].concat(courses().map((c) => [c.id, c.code]));
    $('#filters').innerHTML = opts
      .map(([id, label]) => `<button class="chip ${id === filter ? 'on' : ''}" data-id="${esc(id)}" type="button">${esc(label)}</button>`)
      .join('') + `<button class="chip" id="resetQuiz" type="button" title="Forget which cards you've mastered">Reset stats</button>`;

    $$('#filters .chip[data-id]').forEach((b) => b.addEventListener('click', () => {
      filter = b.dataset.id;
      session = { asked: 0, right: 0 };
      lastKey = null;
      renderFilters(); renderStats(); nextCard();
    }));

    $('#resetQuiz').addEventListener('click', () => {
      Store.resetQuiz();
      session = { asked: 0, right: 0 };
      renderStats(); nextCard();
    });
  }

  /* ---------- picking the next card ---------- */
  function pickCard() {
    let deck = pool();
    if (!deck.length) return null;
    if (deck.length > 1 && lastKey) deck = deck.filter((c) => c.key !== lastKey);

    const weights = deck.map((c) => Store.cardWeight(c.key));
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < deck.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return deck[i];
    }
    return deck[deck.length - 1];
  }

  /* ---------- the card itself ---------- */
  function nextCard() {
    current = pickCard();
    revealed = false;

    if (!current) {
      $('#quiz').innerHTML = `<div class="empty">
        No flashcards in this deck yet. Add a <code>## Flashcards</code> section to a
        lecture's markdown file, then run <code>node build.js</code>.
      </div>`;
      $('#hint').textContent = '';
      return;
    }

    const stat = Store.cardStat(current.key);
    const seen = stat.right + stat.wrong;
    const badge = !seen ? '<span class="tag todo">New</span>'
      : stat.last === 'wrong' ? '<span class="tag todo">Missed last time</span>'
      : `<span class="tag done">${stat.right} right</span>`;

    $('#quiz').innerHTML = `
      <div class="quiz-card" id="card">
        <div class="quiz-meta">
          <span>${esc(current.courseCode)} · ${esc(current.lectureTitle)}</span>
          ${badge}
        </div>
        <div class="quiz-q">${esc(current.q)}</div>
        <div class="quiz-a" id="answer" hidden>${esc(current.a)}</div>
        <div class="quiz-actions" id="actions">
          <button class="btn primary wide" id="revealBtn" type="button">Show answer</button>
        </div>
      </div>
      <div class="quiz-foot">
        <a href="lecture.html?c=${encodeURIComponent(current.courseId)}&l=${encodeURIComponent(current.lectureId)}">Open the lecture →</a>
        <span>${session.asked} answered${session.asked ? ` · ${session.right} right` : ''}</span>
      </div>`;

    $('#card').addEventListener('click', (e) => {
      if (!revealed && e.target.tagName !== 'BUTTON') reveal();
    });
    $('#revealBtn').addEventListener('click', reveal);
    $('#hint').textContent = 'Space reveals the answer. Then ← for “not yet”, → for “got it”.';
  }

  function reveal() {
    if (revealed || !current) return;
    revealed = true;
    $('#answer').hidden = false;
    $('#actions').innerHTML = `
      <button class="btn miss" id="missBtn" type="button">Not yet</button>
      <button class="btn got" id="gotBtn" type="button">Got it</button>`;
    $('#missBtn').addEventListener('click', () => answer(false));
    $('#gotBtn').addEventListener('click', () => answer(true));
  }

  function answer(right) {
    if (!current) return;
    Store.recordAnswer(current.key, right);
    session.asked++;
    if (right) session.right++;
    lastKey = current.key;
    renderStats();
    nextCard();
  }

  /* ---------- keyboard and swipe ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space' || e.key === 'Enter') {
      e.preventDefault();
      revealed ? answer(true) : reveal();
    } else if (revealed && e.key === 'ArrowRight') {
      answer(true);
    } else if (revealed && e.key === 'ArrowLeft') {
      answer(false);
    }
  });

  App.enableSwipe(
    () => { if (revealed) answer(true); else reveal(); },   // swipe left
    () => { if (revealed) answer(false); }                  // swipe right
  );

  renderFilters();
  renderStats();
  nextCard();
})();
