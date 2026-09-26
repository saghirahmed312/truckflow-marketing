// Shared behavior across all pages: mobile nav toggle + (on the demo page)
// the request-a-demo form submission handler.

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHeroCarousel();
  initScrollReveal();
  initFeatureModal();
  initDemoForm();
});

// Feature cards open a detail modal. Each card carries its expanded copy in
// a <template class="feature-detail-tpl">; the single <dialog> is filled from
// it on click. <dialog> gives Escape-to-close and focus containment for free.
const CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';

function initFeatureModal() {
  const modal = document.getElementById('feature-modal');
  if (!modal || typeof modal.showModal !== 'function') return;

  const visual = modal.querySelector('.modal-visual');
  const eyebrow = modal.querySelector('.modal-eyebrow');
  const content = modal.querySelector('.modal-content');
  let trigger = null;

  const open = (card, tpl, btn) => {
    trigger = btn;
    eyebrow.textContent = card.querySelector('h3').textContent;
    content.replaceChildren(tpl.content.cloneNode(true));
    content.querySelector('h2').id = 'feature-modal-title';
    content.querySelectorAll('li').forEach(li => li.insertAdjacentHTML('afterbegin', CHECK_ICON));

    // Real screenshot when the card's template names one; otherwise a mock
    // app window built around the card's icon.
    const { image, alt } = tpl.dataset;
    modal.classList.toggle('has-image', Boolean(image));
    if (image) {
      visual.setAttribute('aria-hidden', 'false');
      visual.innerHTML = `
        <figure class="shot-frame">
          <div class="mock-bar"><i></i><i></i><i></i></div>
          <img src="${image}" alt="" width="1200" height="750" decoding="async">
        </figure>`;
      visual.querySelector('img').alt = alt || '';
    } else {
      visual.setAttribute('aria-hidden', 'true');
      const icon = card.querySelector('.feature-icon svg').outerHTML;
      visual.innerHTML = `
      <div class="mock-window">
        <div class="mock-bar"><i></i><i></i><i></i></div>
        <div class="mock-body">
          <div class="mock-head">
            <div class="mock-icon">${icon}</div>
            <div class="mock-title"><span class="mock-line strong" style="width:70%"></span><span class="mock-line" style="width:45%"></span></div>
          </div>
          <div class="mock-row"><span class="mock-line"></span><span class="mock-pill"></span></div>
          <div class="mock-row"><span class="mock-line" style="max-width:75%"></span><span class="mock-pill blue"></span></div>
          <div class="mock-row"><span class="mock-line" style="max-width:85%"></span><span class="mock-pill"></span></div>
        </div>
      </div>`;
    }

    modal.classList.remove('is-closing');
    document.documentElement.classList.add('modal-open');
    modal.showModal();
    modal.scrollTop = 0;
  };

  // Play the exit animation, then actually close. The timeout is a fallback
  // in case animationend never fires (e.g. animations disabled).
  const close = () => {
    if (!modal.open || modal.classList.contains('is-closing')) return;
    modal.classList.add('is-closing');
    const onEnd = (e) => { if (e.target === modal) finish(); };
    const finish = () => {
      if (!modal.classList.contains('is-closing')) return;
      modal.removeEventListener('animationend', onEnd);
      modal.classList.remove('is-closing');
      modal.close();
    };
    modal.addEventListener('animationend', onEnd);
    setTimeout(finish, 350);
  };

  document.querySelectorAll('.feature-card').forEach(card => {
    const btn = card.querySelector('.feature-more');
    const tpl = card.querySelector('.feature-detail-tpl');
    if (!btn || !tpl) return;
    btn.addEventListener('click', () => open(card, tpl, btn));
    // Screenshots aren't loaded with the page; warm the cache on first
    // hover/focus so the image is usually ready by the time the modal opens.
    if (tpl.dataset.image) {
      const prefetch = () => { new Image().src = tpl.dataset.image; };
      card.addEventListener('pointerenter', prefetch, { once: true });
      btn.addEventListener('focus', prefetch, { once: true });
    }
  });

  modal.querySelector('.modal-close').addEventListener('click', close);
  // Clicks on the dialog element itself (not its contents) are backdrop clicks.
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  // Escape: animate out instead of the browser's instant close.
  modal.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  modal.addEventListener('close', () => {
    document.documentElement.classList.remove('modal-open');
    trigger?.focus();
  });
}

// Hero screenshot carousel: crossfades every 4.5s, dots jump to a slide,
// pauses on hover/focus and while the tab is hidden, swipes on touch.
// Reduced-motion users get the first slide, no autoplay (dots still work).
function initHeroCarousel() {
  const root = document.querySelector('.hero-carousel');
  if (!root) return;

  const slides = [...root.querySelectorAll('.carousel-slide')];
  const dots = [...root.querySelectorAll('.carousel-dot')];
  const caption = root.querySelector('.carousel-caption');
  const track = root.querySelector('.carousel-track');
  const autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INTERVAL = 4500;
  let current = 0;
  let timer = null;
  // Paused while the pointer is over it OR focus is inside it; tracked
  // separately so one ending doesn't resume while the other still holds.
  let hovering = false;
  let focused = false;

  const show = (n) => {
    current = (n + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, i) => {
      if (i === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    caption.textContent = slides[current].dataset.caption;
  };

  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    stop();
    if (autoplay && !hovering && !focused && !document.hidden) timer = setInterval(() => show(current + 1), INTERVAL);
  };

  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));

  root.addEventListener('mouseenter', () => { hovering = true; stop(); });
  root.addEventListener('mouseleave', () => { hovering = false; start(); });
  root.addEventListener('focusin', () => { focused = true; stop(); });
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget)) { focused = false; start(); }
  });
  document.addEventListener('visibilitychange', start);

  // Horizontal swipe on touch devices (vertical scrolling is left alone
  // via touch-action: pan-y on the track).
  let startX = null, startY = null;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    startX = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { show(current + (dx < 0 ? 1 : -1)); start(); }
  }, { passive: true });

  start();
}

// Fade/slide blocks into view the first time they enter the viewport.
// Skipped entirely for reduced-motion users or browsers without
// IntersectionObserver, in which case everything just renders visible.
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const selectors = [
    '.section-head', '.feature-card', '.logo-row', '.testimonial',
    '.price-card', '.pricing-footnote', '.cta-band', '.feature-detail',
  ];
  const targets = document.querySelectorAll(selectors.join(','));
  if (!targets.length) return;

  // Stagger siblings in a grid so cards cascade in rather than pop at once.
  targets.forEach(el => {
    el.classList.add('reveal');
    const grid = el.closest('.feature-grid, .pricing-grid');
    if (grid) {
      const i = Array.prototype.indexOf.call(grid.children, el);
      el.style.transitionDelay = `${Math.min(i, 5) * 70}ms`;
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-visible');
      observer.unobserve(el);
      // Drop the stagger delay once revealed so hover effects stay snappy.
      if (el.style.transitionDelay) {
        setTimeout(() => { el.style.transitionDelay = ''; }, 800);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const panel = document.querySelector('.mobile-nav');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const isOpen = !panel.hasAttribute('hidden');
    if (isOpen) {
      panel.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      panel.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
    }
  });

  panel.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => panel.setAttribute('hidden', ''));
  });
}

// Demo request form. Posts to FormSubmit (https://formsubmit.co) — a free
// hosted form-to-email relay, so each lead arrives as an email with zero
// backend/database to run. The very first submission triggers a one-time
// activation email to LEAD_EMAIL; click the link in it and every lead after
// that is delivered. After activating, FormSubmit also emails a random alias
// you can paste here instead of the plain address, to keep it out of the page.
const LEAD_EMAIL = 'ahsan@4mti.com';
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${LEAD_EMAIL}`;

function initDemoForm() {
  const form = document.getElementById('demo-form');
  if (!form) return;

  const statusEl = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const confirmation = document.getElementById('demo-confirmation');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.classList.remove('error');

    // The form is novalidate (to avoid the browser's default bubbles on
    // submit-attempt styling), so run the built-in checks explicitly.
    if (!form.reportValidity()) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && String(data?.success) === 'true') {
        form.hidden = true;
        confirmation.hidden = false;
        confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        statusEl.textContent = data?.message || 'Something went wrong — please try again or email us directly.';
        statusEl.classList.add('error');
      }
    } catch (err) {
      statusEl.textContent = 'Network error — please try again or email us directly.';
      statusEl.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request a Demo';
    }
  });
}
