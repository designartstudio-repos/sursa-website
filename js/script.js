const CONTACT_EMAIL = 'designartstudiocraiova@gmail.com';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initFooterYear();
  initScrollReveal();
  initContactForm();
  initHeaderScroll();
  initLightbox();

  if (isFinePointer && !prefersReducedMotion) {
    initCustomCursor();
    initMagneticButtons();
  }
});

function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
      toggle.focus();
    }
  });
}

function initFooterYear() {
  document.querySelectorAll('.year').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-img');
  if (!revealEls.length) return;

  document.querySelectorAll('.reveal-group').forEach((group) => {
    group.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.setProperty('--delay', `${Math.min(i * 90, 450)}ms`);
    });
  });

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => observer.observe(el));
}

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;

  function update() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);

    if (y > lastY && y > header.offsetHeight * 2) {
      header.classList.add('is-hidden');
    } else {
      header.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  });
}

function initCustomCursor() {
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let ringX = window.innerWidth / 2;
  let ringY = window.innerHeight / 2;
  let targetX = ringX;
  let targetY = ringY;

  document.addEventListener('mousemove', (e) => {
    document.body.classList.add('cursor-ready');
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
    targetX = e.clientX;
    targetY = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-ready');
  });

  const hoverTargets = 'a, button, .magnetic';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) ring.classList.add('is-active');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) ring.classList.remove('is-active');
  });

  function animateRing() {
    ringX += (targetX - ringX) * 0.18;
    ringY += (targetY - ringY) * 0.18;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);
}

function initMagneticButtons() {
  document.querySelectorAll('.btn, .magnetic').forEach((el) => {
    let bounds;

    el.addEventListener('mouseenter', () => {
      bounds = el.getBoundingClientRect();
    });

    el.addEventListener('mousemove', (e) => {
      if (!bounds) bounds = el.getBoundingClientRect();
      const relX = e.clientX - bounds.left - bounds.width / 2;
      const relY = e.clientY - bounds.top - bounds.height / 2;
      el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.35}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

function initLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.querySelector('#lightbox');
  if (!galleryItems.length || !lightbox) return;

  const lightboxImg = lightbox.querySelector('#lightbox-img');
  const lightboxCaption = lightbox.querySelector('#lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  let lastFocused = null;

  function openLightbox(item) {
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-caption h3');
    if (!img) return;
    lastFocused = document.activeElement;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
    lightboxCaption.textContent = caption ? caption.textContent : '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    lightboxImg.src = '';
    if (lastFocused) lastFocused.focus();
  }

  galleryItems.forEach((item) => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(item);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      closeBtn.focus();
    }
  });
}

function initContactForm() {
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');
  if (!form || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const email = (data.get('email') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !message) {
      showStatus(status, 'Te rugăm completează email-ul și mesajul înainte de a trimite.', 'error');
      return;
    }
    if (!emailPattern.test(email)) {
      showStatus(status, 'Te rugăm introdu o adresă de email validă.', 'error');
      return;
    }

    const firstName = (data.get('firstName') || '').toString().trim();
    const lastName = (data.get('lastName') || '').toString().trim();
    const fullName = (data.get('fullName') || '').toString().trim() || `${firstName} ${lastName}`.trim();
    const phone = (data.get('phone') || '').toString().trim();
    const projectType = (data.get('projectType') || '').toString().trim();
    const surface = (data.get('surface') || '').toString().trim();

    const payload = { fullName, email, phone, projectType, surface, message };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    showStatus(status, 'Se trimite mesajul...', 'sending');

    fetch('contact.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => {
        showStatus(status, 'Mesajul a fost trimis. Îți mulțumim — revenim cât de curând!', 'success');
        form.reset();
      })
      .catch(() => {
        showStatus(status, 'Mesajul nu a putut fi trimis. Te rugăm încearcă din nou sau scrie-ne direct pe email.', 'error');
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
}

function showStatus(el, message, state) {
  el.textContent = message;
  el.dataset.state = state;
}
