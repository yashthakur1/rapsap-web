/* rapsap — site script. Four small, independent pieces; each bails out
   when its markup isn't on the page. */

/* ---- Nav toggle (≤900px) ------------------------------------------------ */
(function () {
  const t = document.querySelector('[data-nav-toggle]');
  const n = document.getElementById('navlinks');
  if (!t || !n) return;
  const set = (open) => { n.classList.toggle('open', open); t.setAttribute('aria-expanded', String(open)); };
  t.addEventListener('click', () => set(!n.classList.contains('open')));
  n.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
})();

/* ---- The loyal card: 3D tilt + confetti --------------------------------
   Fine pointers only — a tilt you can't aim is noise. */
(function () {
  const card = document.querySelector('[data-loyalcard]');
  const stage = card && card.closest('.cardstage');
  const canvas = stage && stage.querySelector('[data-confetti]');
  if (!card || !stage || !canvas) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const MAX_TILT = 11;

  let raf = null;
  const apply = (rx, ry, lift) => {
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${lift}px)`;
  };

  // Layout box, not rendered box: getBoundingClientRect reflects the tilt we
  // just applied and would feed back into the next frame as jitter.
  const box = () => {
    const s = stage.getBoundingClientRect();
    return { left: s.left + card.offsetLeft, top: s.top + card.offsetTop,
             w: card.offsetWidth, h: card.offsetHeight };
  };

  const onMove = (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const r = box();
      const px = Math.min(Math.max((e.clientX - r.left) / r.w, 0), 1);
      const py = Math.min(Math.max((e.clientY - r.top) / r.h, 0), 1);
      apply((0.5 - py) * MAX_TILT * 2, (px - 0.5) * MAX_TILT * 2, 14);
      card.style.setProperty('--sheen', `${(px - 0.5) * 130}%`);
    });
  };
  const onLeave = () => {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    card.style.transition = 'transform 520ms cubic-bezier(.16,1,.3,1)';
    apply(0, 0, 0);
    card.style.setProperty('--sheen', '0%');
    setTimeout(() => (card.style.transition = ''), 540);
  };
  if (finePointer.matches && !reduced.matches) {
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);
  }

  const ctx = canvas.getContext('2d');
  const COLOURS = ['#5074F3', '#C69A3B', '#1AA56F', '#FFFFFF', '#6E8CFF', '#F7F5EE'];
  let bits = [], loop = null, dpr = 1;
  const size = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  window.addEventListener('resize', size);

  const burst = () => {
    const cv = canvas.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    const ox = s.left - cv.left + card.offsetLeft + card.offsetWidth / 2;
    const oy = s.top - cv.top + card.offsetTop + card.offsetHeight / 2;
    const cw = card.offsetWidth, ch = card.offsetHeight;
    for (let i = 0; i < 70; i++) {
      const a = (Math.PI * 2 * i) / 70 + Math.random() * 0.4;
      const speed = 3 + Math.random() * 5;
      bits.push({
        x: ox + Math.cos(a) * (cw * 0.3), y: oy + Math.sin(a) * (ch * 0.3),
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 3.4,
        w: 5 + Math.random() * 6, h: 8 + Math.random() * 7,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.32,
        colour: COLOURS[(Math.random() * COLOURS.length) | 0], life: 1,
      });
    }
    if (!loop) loop = requestAnimationFrame(tick);
  };
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    bits.forEach((b) => {
      b.vy += 0.26; b.vx *= 0.982; b.x += b.vx; b.y += b.vy; b.rot += b.vr; b.life -= 0.009;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
      ctx.globalAlpha = Math.max(b.life, 0); ctx.fillStyle = b.colour;
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); ctx.restore();
    });
    bits = bits.filter((b) => b.life > 0 && b.y < canvas.height / dpr + 60);
    if (bits.length) loop = requestAnimationFrame(tick);
    else { loop = null; ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr); }
  };

  const hint = stage.querySelector('[data-card-hint]');
  card.addEventListener('click', () => {
    if (reduced.matches) return;
    burst();
    if (hint) hint.dataset.spent = 'true';
    card.animate(
      [{ transform: card.style.transform + ' scale(1)' },
       { transform: card.style.transform + ' scale(.97)' },
       { transform: card.style.transform + ' scale(1)' }],
      { duration: 260, easing: 'cubic-bezier(.2,0,0,1)' }
    );
  });
})();

/* ---- Store filter (/stores/) ------------------------------------------- */
(function () {
  const search = document.querySelector('[data-store-search]');
  const cards = document.querySelectorAll('[data-store]');
  const empty = document.querySelector('[data-store-empty]');
  if (!search || !cards.length) return;
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    cards.forEach((c) => { const hit = !q || c.dataset.store.includes(q); c.hidden = !hit; if (hit) shown++; });
    if (empty) empty.classList.toggle('show', shown === 0);
  });
})();

/* ---- Partner enquiry (/partners/) ---------------------------------------
   No backend yet: the form composes a mail to care@rapsap.com so an
   enquiry is never silently dropped. */
(function () {
  const f = document.querySelector('[data-enquiry]');
  if (!f) return;
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(f);
    const body = [...d.entries()].map(([k, v]) => `${k}: ${v}`).join('\n');
    const subject = `partner enquiry — ${d.get('enquiry type') || 'general'}`;
    location.href = `mailto:care@rapsap.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
