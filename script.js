/* Rapsap — shared site behaviour */

/* ---- Mobile navigation ---------------------------------------------- */
(function () {
  const burger = document.querySelector('[data-burger]');
  const panel = document.querySelector('[data-mobile-nav]');
  if (!burger || !panel) return;

  const setOpen = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    panel.setAttribute('data-open', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  burger.addEventListener('click', () => {
    setOpen(burger.getAttribute('aria-expanded') !== 'true');
  });

  // Close on link tap, and on Escape
  panel.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  // Reset when we cross back to desktop
  window.matchMedia('(min-width: 941px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
})();

/* ---- Mark the current page in the nav -------------------------------- */
(function () {
  const here = window.location.pathname.replace(/\/$/, '') || '/index.html';
  document.querySelectorAll('.nav__link, .mobile-nav__link').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http')) return;
    const path = href.startsWith('/') ? href : '/' + href;
    if (path === here || (here === '/' && path === '/index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });
})();

/* ---- Scroll reveal ----------------------------------------------------
   Elements start visible in CSS. We only opt into the animation once we know
   we can finish it: .js on <html> applies the hidden state, a double rAF gives
   the browser a painted frame to transition FROM, and a failsafe timer reveals
   everything if the observer never fires. Worst case: no animation, not a
   blank page. */
(function () {
  const items = [...document.querySelectorAll('.reveal')];
  if (!items.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return; // stay visible

  document.documentElement.classList.add('js');

  // Failsafe covers "the observer never ran at all" (unsupported, errored,
  // never scheduled) — not "the reader hasn't scrolled down yet". Once the
  // observer reports even once we know it works, so we stand down.
  let observerAlive = false;
  const failsafe = setTimeout(() => {
    if (!observerAlive) items.forEach((el) => el.classList.add('is-in'));
  }, 3000);

  const io = new IntersectionObserver(
    (entries) => {
      observerAlive = true;
      clearTimeout(failsafe);
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        // Stagger siblings slightly so groups arrive as a wave, not a slab.
        const delay = Number(entry.target.dataset.revealDelay || 0);
        setTimeout(() => entry.target.classList.add('is-in'), delay);
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0 }
  );

  // Paint one frame at the hidden state so the transition actually runs.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => items.forEach((el) => io.observe(el)))
  );
})();

/* ---- The loyal card: 3D tilt + confetti --------------------------------
   Pointer-driven tilt with a specular band that tracks the light, and a
   confetti burst on press. Fine pointers only — a tilt you can't aim is
   just jitter — and fully skipped under reduced-motion. */
(function () {
  const card = document.querySelector('[data-loyalcard]');
  const stage = card && card.closest('.cardstage');
  const canvas = stage && stage.querySelector('[data-confetti]');
  if (!card || !stage || !canvas) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const MAX_TILT = 11; // degrees — past ~12 it stops reading as a card

  /* ---------- tilt ---------- */
  let raf = null;
  const apply = (rx, ry, lift) => {
    card.style.transform =
      `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${lift}px)`;
  };

  // Measure the card's LAYOUT box, not its rendered box: getBoundingClientRect
  // reflects the tilt we just applied, which would feed back into the next
  // frame and make the card jitter under the cursor.
  const box = () => {
    const s = stage.getBoundingClientRect();
    return {
      left: s.left + card.offsetLeft,
      top: s.top + card.offsetTop,
      w: card.offsetWidth,
      h: card.offsetHeight,
    };
  };

  const onMove = (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const r = box();
      const px = Math.min(Math.max((e.clientX - r.left) / r.w, 0), 1); // 0..1
      const py = Math.min(Math.max((e.clientY - r.top) / r.h, 0), 1);
      apply((0.5 - py) * MAX_TILT * 2, (px - 0.5) * MAX_TILT * 2, 14);
      // sheen sweeps opposite the pointer, like light off a real surface
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

  /* ---------- confetti ---------- */
  const ctx = canvas.getContext('2d');
  const COLOURS = ['#5074F3', '#03926E', '#C1FF45', '#F5C518', '#FCFCFC', '#7B97F6'];
  let bits = [];
  let loop = null;
  let dpr = 1;

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
    // origin relative to the CANVAS, which is deliberately larger than the card
    const cv = canvas.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    const ox = s.left - cv.left + card.offsetLeft + card.offsetWidth / 2;
    const oy = s.top - cv.top + card.offsetTop + card.offsetHeight / 2;
    const cw = card.offsetWidth;
    const ch = card.offsetHeight;

    for (let i = 0; i < 70; i++) {
      const a = (Math.PI * 2 * i) / 70 + Math.random() * 0.4;
      const speed = 3 + Math.random() * 5;
      bits.push({
        x: ox + Math.cos(a) * (cw * 0.3),
        y: oy + Math.sin(a) * (ch * 0.3),
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 3.4, // bias upward so it arcs
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 7,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.32,
        colour: COLOURS[(Math.random() * COLOURS.length) | 0],
        life: 1,
      });
    }
    if (!loop) loop = requestAnimationFrame(tick);
  };

  const tick = () => {
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    bits.forEach((b) => {
      b.vy += 0.26;        // gravity
      b.vx *= 0.982;       // drag
      b.x += b.vx;
      b.y += b.vy;
      b.rot += b.vr;
      b.life -= 0.009;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.globalAlpha = Math.max(b.life, 0);
      ctx.fillStyle = b.colour;
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    });
    bits = bits.filter((b) => b.life > 0 && b.y < canvas.height / dpr + 60);

    if (bits.length) {
      loop = requestAnimationFrame(tick);
    } else {
      loop = null;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }
  };

  const hint = stage.querySelector('[data-card-hint]');
  card.addEventListener('click', () => {
    if (reduced.matches) return;
    burst();
    if (hint) hint.dataset.spent = 'true';
    // a small physical press, so the click has weight
    card.animate(
      [{ transform: card.style.transform + ' scale(1)' },
       { transform: card.style.transform + ' scale(.97)' },
       { transform: card.style.transform + ' scale(1)' }],
      { duration: 260, easing: 'cubic-bezier(.2,0,0,1)' }
    );
  });
})();

/* ---- Store filter (stores.html) --------------------------------------- */
(function () {
  const search = document.querySelector('[data-store-search]');
  const cards = document.querySelectorAll('[data-store]');
  const empty = document.querySelector('[data-store-empty]');
  if (!search || !cards.length) return;

  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    cards.forEach((card) => {
      const hit = !q || card.dataset.store.toLowerCase().includes(q);
      card.hidden = !hit;
      if (hit) shown++;
    });
    if (empty) empty.hidden = shown !== 0;
  });
})();
