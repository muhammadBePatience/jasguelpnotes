/* ==========================================================================
   page-help.js — the guides, readable inside the site itself.
   ---------------------------------------------------------------------------
   The markdown in docs/ is compiled into content.js by build.js, so these
   pages work offline like everything else. Edit the .md files and rebuild;
   this page picks up the changes with no code edits.
   ========================================================================== */

(function () {
  const { $, $$, esc, param, CONTENT, renderSidebar, initChrome } = App;

  renderSidebar(null);
  initChrome();

  const guides = CONTENT.guides || [];
  const template = CONTENT.template || '';

  if (!guides.length) {
    $('#guide').innerHTML = `<div class="empty">
      No guides found. Put markdown files in <code>docs/</code> and run <code>node build.js</code>.
    </div>`;
    return;
  }

  /* Which guide to show — from the URL, so links can point straight at one. */
  let currentId = param('g') || guides[0].id;
  if (!guides.some((g) => g.id === currentId)) currentId = guides[0].id;

  function renderNav() {
    $('#guideNav').innerHTML = guides
      .map((g) => `<button class="chip ${g.id === currentId ? 'on' : ''}" data-id="${esc(g.id)}" type="button">${esc(g.title)}</button>`)
      .join('');

    $$('#guideNav .chip').forEach((b) => b.addEventListener('click', () => {
      currentId = b.dataset.id;
      history.replaceState(null, '', 'help.html?g=' + encodeURIComponent(currentId));
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
  }

  function renderGuide() {
    const g = guides.find((x) => x.id === currentId);
    document.title = g.title + ' — Lecture Hub';
    $('#title').textContent = g.title;
    $('#sub').textContent = g.summary || '';

    let html = `<div class="prose">${g.html}</div>`;

    // The template is only useful on the page about writing lectures.
    if (template && /lecture/i.test(g.title)) {
      html += `
        <section class="section" style="margin-top:30px">
          <h2>Blank template</h2>
          <div class="prose" style="padding:18px 22px">
            <p style="margin-top:0">Copy this into a new <code>.md</code> file inside the course's folder.</p>
            <pre><code id="tpl">${esc(template.trim())}</code></pre>
            <button class="btn" id="copyTpl" type="button">Copy template</button>
          </div>
        </section>`;
    }

    $('#guide').innerHTML = html;

    const copy = $('#copyTpl');
    if (copy) {
      copy.addEventListener('click', async () => {
        const text = $('#tpl').textContent;
        try {
          await navigator.clipboard.writeText(text);
          copy.textContent = '✓  Copied';
        } catch (e) {
          // clipboard is blocked outside https — select it instead so he can copy by hand
          const range = document.createRange();
          range.selectNodeContents($('#tpl'));
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          copy.textContent = 'Selected — press Cmd+C';
        }
        setTimeout(() => { copy.textContent = 'Copy template'; }, 2500);
      });
    }
  }

  function render() { renderNav(); renderGuide(); }

  render();
})();
