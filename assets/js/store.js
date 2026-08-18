/* ==========================================================================
   store.js — everything remembered between visits, saved in the browser.
   ---------------------------------------------------------------------------
   Holds: which lectures are reviewed, the chosen theme, the last lecture
   opened, and per-flashcard quiz stats.

   All of it is wrapped in try/catch so the site still works where storage is
   unavailable (private windows, some in-app browsers). In that case things
   simply don't persist between visits — nothing breaks.
   ========================================================================== */

const Store = (() => {
  const KEY = 'lecturehub.v1';

  const blank = () => ({
    reviewed: {},   // { courseId: { lectureId: true } }
    theme: null,    // 'dark' | 'light'
    last: null,     // { courseId, lectureId, at }
    cards: {}       // { cardKey: { right, wrong, last } }
  });

  let memory = blank();
  let usable = true;

  function load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) memory = Object.assign(blank(), JSON.parse(raw));
    } catch (e) {
      usable = false;
    }
  }

  function save() {
    if (!usable) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(memory));
    } catch (e) {
      usable = false;
    }
  }

  load();

  return {
    /* ---------------- reviewed lectures ---------------- */

    isReviewed(courseId, lectureId) {
      return !!(memory.reviewed[courseId] && memory.reviewed[courseId][lectureId]);
    },

    toggleReviewed(courseId, lectureId) {
      if (!memory.reviewed[courseId]) memory.reviewed[courseId] = {};
      const next = !memory.reviewed[courseId][lectureId];
      if (next) memory.reviewed[courseId][lectureId] = true;
      else delete memory.reviewed[courseId][lectureId];
      save();
      return next;
    },

    reviewedCount(courseId, lectureIds) {
      return lectureIds.filter((id) => this.isReviewed(courseId, id)).length;
    },

    /* ---------------- resume where you left off ---------------- */

    recordVisit(courseId, lectureId) {
      memory.last = { courseId, lectureId, at: Date.now() };
      save();
    },

    lastVisit() {
      return memory.last;
    },

    /* ---------------- quiz stats -----------------
       A card is identified by course + lecture + its position in that
       lecture, so stats survive edits to other cards in the same file. */

    cardKey(courseId, lectureId, index) {
      return courseId + '::' + lectureId + '::' + index;
    },

    cardStat(key) {
      return memory.cards[key] || { right: 0, wrong: 0, last: null };
    },

    recordAnswer(key, gotItRight) {
      const s = this.cardStat(key);
      if (gotItRight) s.right++; else s.wrong++;
      s.last = gotItRight ? 'right' : 'wrong';
      memory.cards[key] = s;
      save();
    },

    /* How badly this card needs practice. Higher = ask sooner.
       Never seen sits in the middle so new cards mix in with weak ones. */
    cardWeight(key) {
      const s = this.cardStat(key);
      const seen = s.right + s.wrong;
      if (!seen) return 3;
      if (s.last === 'wrong') return 6;
      return Math.max(1, 4 - s.right);
    },

    quizSummary(keys) {
      let mastered = 0, weak = 0, unseen = 0;
      keys.forEach((k) => {
        const s = this.cardStat(k);
        const seen = s.right + s.wrong;
        if (!seen) unseen++;
        else if (s.last === 'wrong' || s.right < 2) weak++;
        else mastered++;
      });
      return { mastered, weak, unseen, total: keys.length };
    },

    resetQuiz() { memory.cards = {}; save(); },

    /* ---------------- theme ---------------- */

    getTheme() { return memory.theme; },
    setTheme(name) { memory.theme = name; save(); },

    /* ---------------- housekeeping ---------------- */

    reset() { memory = blank(); save(); },
    get persists() { return usable; }
  };
})();
