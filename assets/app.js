(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // шапка становится плотной после первого экрана
  const top = $('.top');
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:120px;height:1px;width:1px';
  document.body.prepend(sentinel);
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => top.classList.toggle('solid', !e.isIntersecting)).observe(sentinel);

  // меню на телефоне
  const menu = $('.menu'), burger = $('.burger');
  burger.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open; document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  // появление при прокрутке
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -6% 0px' }) : null;
  const reveal = (root = document) => $$('.rv:not(.in)', root).forEach(el => io ? io.observe(el) : el.classList.add('in'));
  reveal();

  // подсветка пункта в подменю раздела
  const subs = $$('.sub a');
  if (subs.length && 'IntersectionObserver' in window) {
    const map = new Map(subs.map(a => [a.getAttribute('href').slice(1), a]));
    const so = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { subs.forEach(a => a.classList.remove('on')); map.get(e.target.id)?.classList.add('on'); }
    }), { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) so.observe(el); });
  }

  // просмотр фото и видео
  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.innerHTML = '<div class="lb-st"></div><button class="x" aria-label="Закрыть">×</button><button class="pv" aria-label="Назад">‹</button><button class="nx" aria-label="Дальше">›</button><div class="cnt"></div>';
  document.body.appendChild(lb);
  const st = $('.lb-st', lb), cnt = $('.cnt', lb);
  let list = [], idx = 0;
  function show() {
    const it = list[idx];
    st.innerHTML = it.embed
      ? `<iframe src="${esc(it.embed)}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock" allowfullscreen></iframe>`
      : `<img src="${esc(it.src)}" alt="">`;
    cnt.textContent = it.embed ? (it.title || '') : (list.length > 1 ? `${idx + 1} / ${list.length}` : '');
    $('.pv', lb).style.visibility = $('.nx', lb).style.visibility = list.length > 1 ? 'visible' : 'hidden';
  }
  function open(items, i) { list = items; idx = i; show(); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function close() { lb.classList.remove('open'); st.innerHTML = ''; document.body.style.overflow = ''; }
  const step = d => { idx = (idx + d + list.length) % list.length; show(); };
  $('.x', lb).onclick = close; $('.pv', lb).onclick = () => step(-1); $('.nx', lb).onclick = () => step(1);
  lb.addEventListener('click', e => { if (e.target === lb || e.target === st) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1);
  });
  let sx = null;
  lb.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); sx = null; });
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-lb]');
    if (a) { e.preventDefault(); const g = $$(`[data-lb="${a.dataset.lb}"]`); open(g.map(x => ({ src: x.getAttribute('href') })), g.indexOf(a)); return; }
    const v = e.target.closest('[data-embed]');
    if (v) { const g = $$(`[data-embed][data-g="${v.dataset.g}"]`); open(g.map(x => ({ embed: x.dataset.embed, title: x.dataset.title })), g.indexOf(v)); }
  });

  // отзывы
  const box = $('#revs'), data = $('#revdata');
  if (box && data) {
    const R = JSON.parse(data.textContent), more = $('#more'); let shown = 0;
    const add = n => {
      R.slice(shown, shown + n).forEach(r => {
        const long = r.t.length > 420, d = document.createElement('article');
        d.className = 'rev rv' + (long ? ' long' : '');
        d.innerHTML = `<header><span class="av">${esc(r.n.trim()[0] || '·').toUpperCase()}</span><div><b>${esc(r.n)}</b>${r.k ? `<small>${esc(r.k)}</small>` : ''}</div></header><p>${esc(r.t)}</p>` + (long ? '<button class="rd">Читать полностью</button>' : '');
        box.appendChild(d);
      });
      shown = Math.min(R.length, shown + n); reveal(box);
      more.hidden = shown >= R.length;
      more.textContent = `Показать ещё (${R.length - shown})`;
    };
    box.addEventListener('click', e => { const b = e.target.closest('.rd'); if (!b) return; const c = b.parentElement; c.classList.toggle('open'); b.textContent = c.classList.contains('open') ? 'Свернуть' : 'Читать полностью'; });
    more.addEventListener('click', () => add(12)); add(12);
  }

  // окно «Оставить отзыв»
  const dlg = $('#rform');
  if (dlg) {
    $$('[data-open="rform"]').forEach(b => b.addEventListener('click', () => dlg.showModal()));
    $$('[data-close]', dlg).forEach(b => b.addEventListener('click', () => dlg.close()));
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    const f = $('form', dlg), msg = $('.rf-msg', dlg), btn = $('button[type=submit]', f);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      msg.className = 'rf-msg';
      if (f.dataset.preview) { msg.textContent = 'Это превью: отправка заработает на хостинге.'; msg.classList.add('err'); return; }
      if (!f.name.value.trim()) { msg.textContent = 'Напишите имя.'; msg.classList.add('err'); return; }
      if (f.text.value.trim().length < 10) { msg.textContent = 'Отзыв слишком короткий.'; msg.classList.add('err'); return; }
      if (!f.agree.checked) { msg.textContent = 'Нужно согласие на обработку данных.'; msg.classList.add('err'); return; }
      btn.disabled = true; msg.textContent = 'Отправляю…';
      try {
        const r = await fetch(f.action, { method: 'POST', body: new FormData(f) });
        const j = await r.json();
        msg.textContent = j.msg; msg.classList.add(j.ok ? 'ok' : 'err');
        if (j.ok) { f.reset(); setTimeout(() => dlg.close(), 2200); }
      } catch (_) { msg.textContent = 'Не получилось отправить. Попробуйте позже или напишите в Telegram.'; msg.classList.add('err'); }
      btn.disabled = false;
    });
  }
})();
