/* ============================================
   MINAYA ALGORA — Interactions
   Light scroll-based reveals + nav state.
   ============================================ */

// Nav: add border when scrolled
const nav = document.querySelector('.nav');
const onScroll = () => {
  if (window.scrollY > 8) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal on scroll using IntersectionObserver
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger by index within batch for elegance
          entry.target.style.transitionDelay = `${Math.min(i * 60, 240)}ms`;
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  // Fallback: just show everything
  revealEls.forEach((el) => el.classList.add('visible'));
}

// Smooth scroll for in-page anchors
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Tiny intro: fade the body in to avoid flash
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.6s ease';
requestAnimationFrame(() => {
  document.body.style.opacity = '1';
});

// Contact form: async submit with feedback (Formspree)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const status = document.getElementById('form-status');
  const submitBtn = contactForm.querySelector('button[type="submit"]');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'form-status';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        contactForm.reset();
        status.innerHTML = `
          <span class="form-status-icon" aria-hidden="true">✓</span>
          <span class="form-status-body">
            <strong class="form-status-title">Got it.</strong>
            <span class="form-status-desc">My n8n workflow just pinged me about your message. I'll be back before your coffee's cold.</span>
          </span>
        `;
        status.classList.add('success');
      } else {
        const data = await res.json().catch(() => ({}));
        status.textContent = data.error || "Something went wrong. Try email instead?";
        status.classList.add('error');
      }
    } catch (err) {
      status.textContent = "Network hiccup. Try email instead?";
      status.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  });
}
