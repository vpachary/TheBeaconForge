/**
 * THE BEACON FORGE — INTERACTIVE ATELIER ENGINE
 * Vanilla JavaScript (Zero Dependencies, Ultra-Fast, Edge Compatible)
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initBeaconTorch();
  initAmbientCanvas();
  initPackageSelectButtons();
  initCommissionForm();
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

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  function render() {
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;
    torch.style.left = `${currentX}px`;
    torch.style.top = `${currentY}px`;
    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   3. AMBIENT CANVAS (FORGE EMBERS & LUMINESCENCE)
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
   4. PACKAGE SELECTION PRESETS
   ========================================================================== */
function initPackageSelectButtons() {
  const selectButtons = document.querySelectorAll('.select-pkg-btn');
  const packageSelect = document.getElementById('packageSelect');

  selectButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const pkg = btn.getAttribute('data-package');
      if (packageSelect && pkg) {
        // Find matching option
        for (let i = 0; i < packageSelect.options.length; i++) {
          if (packageSelect.options[i].value === pkg || packageSelect.options[i].text.includes(pkg)) {
            packageSelect.selectedIndex = i;
            break;
          }
        }
      }
      playTactileSound(587.33); // D5 chime
    });
  });
}

/* ==========================================================================
   5. COMMISSION INTAKE FORM DISPATCH
   ========================================================================== */
function initCommissionForm() {
  const form = document.getElementById('commissionForm');
  const nameInput = document.getElementById('clientName');
  const emailInput = document.getElementById('clientEmail');
  const companyInput = document.getElementById('clientCompany');
  const packageSelect = document.getElementById('packageSelect');
  const scopeInput = document.getElementById('projectScope');
  const successSlate = document.getElementById('commissionSuccess');
  const tokenDisplay = document.getElementById('commissionToken');
  const btnSubmit = document.getElementById('btnCommissionSubmit');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const company = companyInput ? companyInput.value.trim() : 'Not Specified';
    const selectedPkg = packageSelect ? packageSelect.value : 'General Inquiry';
    const scope = scopeInput ? scopeInput.value.trim() : '';

    if (!name) {
      showToast('Please provide your name.');
      if (nameInput) nameInput.focus();
      return;
    }

    if (!email || !isValidEmail(email)) {
      showToast('Please provide a valid business email.');
      if (emailInput) emailInput.focus();
      return;
    }

    const randomToken = `TBF-${Math.floor(1000 + Math.random() * 9000)}`;

    // Set button loading state
    const originalBtnHTML = btnSubmit ? btnSubmit.innerHTML : '';
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span>Transmitting Commission Brief...</span>';
    }

    // Forward to hello@thebeaconforge.com
    try {
      await fetch('https://formsubmit.co/ajax/hello@thebeaconforge.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_name: name,
          client_email: email,
          company_or_website: company,
          package_selected: selectedPkg,
          project_scope: scope,
          commission_token: randomToken,
          source: 'thebeaconforge.com Commission Intake',
          _subject: `New Commission Request: ${name} (${selectedPkg}) [${randomToken}]`,
          _template: 'table'
        })
      });
    } catch (err) {
      console.warn('Commission submission network notice:', err);
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalBtnHTML;
      }
    }

    // Store submission in localStorage
    const history = JSON.parse(localStorage.getItem('tbf_commissions') || '[]');
    history.push({
      name,
      email,
      company,
      package: selectedPkg,
      token: randomToken,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('tbf_commissions', JSON.stringify(history));

    // Play subtle audio confirmation
    playTactileSound(659.25); // E5 note

    // Update UI
    if (tokenDisplay) tokenDisplay.textContent = `#${randomToken}`;
    form.style.display = 'none';
    if (successSlate) successSlate.classList.add('active');

    showToast(`Inquiry #${randomToken} confirmed. We will reply within 24h.`);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ==========================================================================
   6. PRIVACY & COMPLIANCE MODAL
   ========================================================================== */
function initModal() {
  const privacyModal = document.getElementById('privacyModal');
  const btnOpenPrivacy = document.getElementById('btnOpenPrivacy');
  const btnClosePrivacy = document.getElementById('btnClosePrivacy');
  const btnClosePrivacyBtn = document.getElementById('btnClosePrivacyBtn');
  const privacyBackdrop = document.getElementById('privacyBackdrop');

  function openPrivacy(e) {
    if (e) e.preventDefault();
    if (privacyModal) {
      privacyModal.classList.add('active');
      privacyModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      playTactileSound(440);
    }
  }

  function closePrivacy() {
    if (privacyModal) {
      privacyModal.classList.remove('active');
      privacyModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (btnOpenPrivacy) btnOpenPrivacy.addEventListener('click', openPrivacy);
  if (btnClosePrivacy) btnClosePrivacy.addEventListener('click', closePrivacy);
  if (btnClosePrivacyBtn) btnClosePrivacyBtn.addEventListener('click', closePrivacy);
  if (privacyBackdrop) privacyBackdrop.addEventListener('click', closePrivacy);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePrivacy();
    }
  });
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
    // Silent fail for audio autoplay restrictions
  }
}

/* ==========================================================================
   8. COPY TO CLIPBOARD ACTIONS & TOAST
   ========================================================================== */
function initCopyActions() {
  const emailLink = document.getElementById('emailContactLink');
  const emailBox = document.getElementById('emailContactBox');

  function copyEmail(e) {
    if (e) e.preventDefault();
    navigator.clipboard.writeText('hello@thebeaconforge.com').then(() => {
      showToast('Copied: hello@thebeaconforge.com');
      playTactileSound(587.33);
    }).catch(() => {
      window.location.href = 'mailto:hello@thebeaconforge.com';
    });
  }

  if (emailLink) emailLink.addEventListener('click', copyEmail);
  if (emailBox) emailBox.addEventListener('click', copyEmail);
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
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}
