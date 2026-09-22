/**
 * THE BEACON FORGE — INTERACTIVE ATELIER ENGINE
 * Vanilla JavaScript (Zero Dependencies, Ultra-Fast)
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initBeaconTorch();
  initAmbientCanvas();
  initForms();
  initModal();
  initAudioEngine();
  initCopyActions();
});

/* ==========================================================================
   1. LIVE UTC TIME CLOCK
   ========================================================================== */
function initLiveClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds} UTC`;
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. BEACON TORCH CURSOR LIGHT
   ========================================================================== */
function initBeaconTorch() {
  const torch = document.getElementById('beaconTorch');
  if (!torch) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 3;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function render() {
    // Smooth lerp
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;
    torch.style.left = `${currentX}px`;
    torch.style.top = `${currentY}px`;
    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   4. AMBIENT CANVAS (FORGE EMBERS & LUMINESCENCE)
   ========================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const PARTICLE_COUNT = 32;

  class Ember {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedY = Math.random() * 0.4 + 0.15;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.6 + 0.2;
      this.maxAlpha = this.alpha;
      this.decay = Math.random() * 0.002 + 0.001;
      this.color = Math.random() > 0.4 ? '212, 175, 55' : '244, 214, 155'; // Gold or Champagne
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.alpha -= this.decay;

      if (this.y < -10 || this.alpha <= 0) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${Math.max(0, this.alpha)})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(${this.color}, 0.5)`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Ember());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   5. WAITLIST DISPATCH & PASS GENERATION
   ========================================================================== */
function initForms() {
  const form = document.getElementById('waitlistForm');
  const emailInput = document.getElementById('clientEmail');
  const successSlate = document.getElementById('successSlate');
  const tokenDisplay = document.getElementById('tokenDisplay');
  const btnReset = document.getElementById('btnResetForm');
  const btnDownloadPass = document.getElementById('btnDownloadPass');

  if (!form || !emailInput) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (!email || !isValidEmail(email)) {
      showToast('Please provide a valid executive email address.');
      emailInput.focus();
      return;
    }

    const selectedScope = form.querySelector('input[name="projectType"]:checked')?.value || 'Digital Flagship';
    const randomToken = `TBF-${Math.floor(1000 + Math.random() * 9000)}`;

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('tbf_waitlist') || '[]');
    existing.push({
      email,
      scope: selectedScope,
      token: randomToken,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('tbf_waitlist', JSON.stringify(existing));

    // Play subtle audio confirmation
    playTactileSound(587.33); // D5 note

    // Update UI
    if (tokenDisplay) tokenDisplay.textContent = `#${randomToken}`;
    form.style.display = 'none';
    successSlate.classList.add('active');

    showToast(`Access pass #${randomToken} confirmed for ${email}`);
  });

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      form.reset();
      form.style.display = 'block';
      successSlate.classList.remove('active');
    });
  }

  if (btnDownloadPass) {
    btnDownloadPass.addEventListener('click', () => {
      const token = tokenDisplay ? tokenDisplay.textContent : '#TBF-8924';
      downloadPassFile(token);
    });
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function downloadPassFile(token) {
  const content = `=====================================================
THE BEACON FORGE — ATELIER OF DIGITAL FLAGSHIPS
Priority Early Access Pass
=====================================================

Pass Token:   ${token}
Status:       Founding Cohort (Priority Tier)
Window:       Spring / Q2 2026 Official Unveiling
Dispatch:     hello@thebeaconforge.com
Web:          https://thebeaconforge.com

This pass entitles the holder to an expedited consultation
and priority project scoping for the 2026 calendar year.

"Where luminous clarity meets master craftsmanship."
=====================================================`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TheBeaconForge-Pass-${token.replace('#', '')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Priority Access Pass downloaded.');
}

/* ==========================================================================
   6. PRIVATE CONSULTATION MODAL
   ========================================================================== */
function initModal() {
  const modal = document.getElementById('briefModal');
  const btnOpen = document.getElementById('btnOpenConsultModal');
  const btnInquireMasthead = document.getElementById('btnInquire');
  const btnClose = document.getElementById('btnCloseModal');
  const backdrop = document.getElementById('modalBackdrop');
  const form = document.getElementById('modalBriefForm');
  const successState = document.getElementById('modalSuccess');
  const btnCloseSuccess = document.getElementById('btnCloseSuccessModal');

  if (!modal) return;

  function openModal(e) {
    if (e) e.preventDefault();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    playTactileSound(440); // A4 note
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (btnOpen) btnOpen.addEventListener('click', openModal);
  if (btnInquireMasthead) {
    btnInquireMasthead.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(e);
    });
  }

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const briefData = {
        name: document.getElementById('modalClientName')?.value,
        company: document.getElementById('modalClientCompany')?.value,
        email: document.getElementById('modalClientEmail')?.value,
        budget: document.getElementById('modalBudget')?.value,
        notes: document.getElementById('modalNotes')?.value,
        date: new Date().toISOString()
      };

      const existingBriefs = JSON.parse(localStorage.getItem('tbf_briefs') || '[]');
      existingBriefs.push(briefData);
      localStorage.setItem('tbf_briefs', JSON.stringify(existingBriefs));

      form.style.display = 'none';
      if (successState) successState.style.display = 'block';
      playTactileSound(659.25); // E5 note
      showToast('Project brief dispatched to lead architect.');
    });
  }

  if (btnCloseSuccess) {
    btnCloseSuccess.addEventListener('click', () => {
      closeModal();
      setTimeout(() => {
        if (form) form.reset();
        if (form) form.style.display = 'flex';
        if (successState) successState.style.display = 'none';
      }, 400);
    });
  }
}

/* ==========================================================================
   7. WEB AUDIO API TACTILE CHIMES (NO EXTERNAL AUDIO FILES)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = false;

function initAudioEngine() {
  const soundToggle = document.getElementById('soundToggle');
  const soundLabel = soundToggle ? soundToggle.querySelector('.sound-label') : null;

  if (!soundToggle) return;

  soundToggle.addEventListener('click', () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }

    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    soundEnabled = !soundEnabled;
    soundToggle.classList.toggle('active', soundEnabled);

    if (soundLabel) {
      soundLabel.textContent = soundEnabled ? 'SOUND: ON' : 'SOUND: OFF';
    }

    if (soundEnabled) {
      playTactileSound(523.25); // C5
      showToast('Atelier acoustics enabled.');
    } else {
      showToast('Acoustics muted.');
    }
  });
}

function playTactileSound(freq = 440) {
  if (!soundEnabled || !audioCtx) return;

  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (err) {
    // Silent fail for audio restrictions
  }
}

/* ==========================================================================
   8. COPY TO CLIPBOARD ACTIONS & TOAST
   ========================================================================== */
function initCopyActions() {
  const emailLink = document.getElementById('emailContactLink');
  if (!emailLink) return;

  emailLink.addEventListener('click', (e) => {
    // If user wants to open mail client, let standard click work or copy
    navigator.clipboard.writeText('hello@thebeaconforge.com').then(() => {
      showToast('Copied: hello@thebeaconforge.com');
      playTactileSound(587.33);
    }).catch(() => {});
  });
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}
