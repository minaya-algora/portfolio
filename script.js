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

// Tool icons: replace missing icons with initial fallback
document.querySelectorAll('.tool-card img').forEach((img) => {
  img.addEventListener('error', () => {
    const card = img.parentElement;
    if (!card) return;
    const initial = card.getAttribute('data-initial') || '·';
    const fallback = document.createElement('div');
    fallback.className = 'tool-fallback';
    fallback.textContent = initial;
    img.replaceWith(fallback);
  });
});

// Carousel prev/next buttons
document.querySelectorAll('.carousel-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.carousel);
    if (!target) return;
    const dir = parseInt(btn.dataset.dir || '1', 10);
    const firstItem = target.querySelector('.carousel-item');
    const step = firstItem ? firstItem.getBoundingClientRect().width + 16 : 320;
    target.scrollBy({ left: dir * step, behavior: 'smooth' });
  });
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
        showSuccessModal();
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

  // Success modal wiring
  const modal = document.getElementById('success-modal');
  const modalClose = document.getElementById('success-modal-close');
  const modalCta = document.getElementById('success-modal-cta');

  function showSuccessModal() {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modalCta && modalCta.focus();
  }
  function hideSuccessModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  modalClose && modalClose.addEventListener('click', hideSuccessModal);
  modalCta && modalCta.addEventListener('click', hideSuccessModal);
  modal && modal.addEventListener('click', (e) => {
    if (e.target === modal) hideSuccessModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) hideSuccessModal();
  });
}
