// Shared behavior across all pages: mobile nav toggle + (on the demo page)
// the request-a-demo form submission handler.

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollReveal();
  initDemoForm();
});

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
