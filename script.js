/**
 * The Beacon Forge — Interactive Engine
 * Lightweight, accessible, zero-dependency client scripting.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientCanvas();
  initBeaconTorch();
  initPackageSelectButtons();
  initContactForm();
  initPrivacyModal();
  initEmailCopyHelpers();
});

/* ==========================================================================
   1. AMBIENT PARTICLES CANVAS
   ========================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const PARTICLE_COUNT = 24;

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 1.6 + 0.4;
      this.speedY = Math.random() * 0.35 + 0.12;
      this.speedX = (Math.random() - 0.5) * 0.25;
      this.opacity = Math.random() * 0.35 + 0.15;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.fillStyle = `rgba(216, 173, 98, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  let isVisible = true;
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
  });

  function animate() {
    if (isVisible) {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.update();
        p.draw();
      }
    }
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. BEACON TORCH CURSOR LIGHT
   ========================================================================== */
function initBeaconTorch() {
  const torch = document.getElementById('beaconTorch');
  if (!torch) return;

  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouch || prefersReduced) {
    torch.style.display = 'none';
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 3;
  let currentX = mouseX;
  let currentY = mouseY;
  let isMoving = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isMoving) {
      isMoving = true;
      requestAnimationFrame(renderTorch);
    }
  }, { passive: true });

  function renderTorch() {
    const dx = mouseX - currentX;
    const dy = mouseY - currentY;
    currentX += dx * 0.08;
    currentY += dy * 0.08;
    torch.style.left = `${currentX}px`;
    torch.style.top = `${currentY}px`;

    if (Math.abs(dx) > 0.15 || Math.abs(dy) > 0.15) {
      requestAnimationFrame(renderTorch);
    } else {
      isMoving = false;
    }
  }

  renderTorch();
}

/* ==========================================================================
   3. PACKAGE SELECTION LINKAGE
   ========================================================================== */
function initPackageSelectButtons() {
  const buttons = document.querySelectorAll('[data-package]');
  const packageSelect = document.getElementById('projectPackage');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const pkg = btn.getAttribute('data-package');
      if (packageSelect && pkg) {
        for (let i = 0; i < packageSelect.options.length; i++) {
          if (packageSelect.options[i].value.includes(pkg) || pkg.includes(packageSelect.options[i].value)) {
            packageSelect.selectedIndex = i;
            break;
          }
        }
      }
    });
  });
}

/* ==========================================================================
   4. CONTACT FORM VALIDATION & SUBMISSION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successSlate = document.getElementById('formSuccessSlate');
  const resetBtn = document.getElementById('btnResetForm');
  const submitBtn = document.getElementById('btnSubmitForm');

  if (!form || !successSlate) return;

  const nameInput = document.getElementById('clientName');
  const emailInput = document.getElementById('clientEmail');
  const messageInput = document.getElementById('projectDetails');

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  function setFieldError(input, hasError) {
    const parent = input.closest('.form-group');
    if (!parent) return;
    if (hasError) {
      parent.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
    } else {
      parent.classList.remove('has-error');
      input.setAttribute('aria-invalid', 'false');
    }
  }

  nameInput?.addEventListener('input', () => setFieldError(nameInput, !nameInput.value.trim()));
  emailInput?.addEventListener('input', () => setFieldError(emailInput, !validateEmail(emailInput.value)));
  messageInput?.addEventListener('input', () => setFieldError(messageInput, !messageInput.value.trim()));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let hasErrors = false;

    if (!nameInput.value.trim()) {
      setFieldError(nameInput, true);
      hasErrors = true;
    } else {
      setFieldError(nameInput, false);
    }

    if (!validateEmail(emailInput.value)) {
      setFieldError(emailInput, true);
      hasErrors = true;
    } else {
      setFieldError(emailInput, false);
    }

    if (!messageInput.value.trim()) {
      setFieldError(messageInput, true);
      hasErrors = true;
    } else {
      setFieldError(messageInput, false);
    }

    if (hasErrors) {
      const firstError = form.querySelector('.form-group.has-error input, .form-group.has-error textarea');
      firstError?.focus();
      return;
    }

    // Submit state
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending inquiry...</span>';

    const formData = new FormData(form);

    try {
      // Use FormSubmit AJAX endpoint
      const response = await fetch('https://formsubmit.co/ajax/hello@thebeaconforge.com', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      if (response.ok) {
        form.hidden = true;
        successSlate.hidden = false;
        showToast('Inquiry sent successfully. Talk soon!');
      } else {
        // Fallback to standard form submission if AJAX fails
        form.submit();
      }
    } catch {
      // Network error, submit normally
      form.submit();
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  resetBtn?.addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    successSlate.hidden = true;
    nameInput?.focus();
  });
}

/* ==========================================================================
   5. PRIVACY MODAL
   ========================================================================== */
function initPrivacyModal() {
  const modal = document.getElementById('privacyModal');
  const openBtn = document.getElementById('btnOpenPrivacy');
  const closeBtn = document.getElementById('btnClosePrivacy');
  const closeBtnBottom = document.getElementById('btnClosePrivacyBtn');
  const backdrop = document.getElementById('privacyBackdrop');

  if (!modal || !openBtn) return;

  let previousActiveElement = null;

  function openModal() {
    previousActiveElement = document.activeElement;
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }

  function closeModal() {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  }

  openBtn.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  closeBtnBottom?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });

  // Focus trap for accessibility
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  });
}

/* ==========================================================================
   6. EMAIL COPY HELPERS & TOAST NOTIFICATION
   ========================================================================== */
function initEmailCopyHelpers() {
  const emailLinks = [
    document.getElementById('directEmailLink'),
    document.getElementById('footerEmailLink')
  ].filter(Boolean);

  emailLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      // If user right-clicks or opens mailto, that's fine; but also copy address to clipboard
      const email = 'hello@thebeaconforge.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          showToast('Email address copied to clipboard');
        }).catch(() => {});
      }
    });
  });
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('is-visible');
  });

  setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, 3500);
}
