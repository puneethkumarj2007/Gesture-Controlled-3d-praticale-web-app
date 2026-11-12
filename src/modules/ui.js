/**
 * WonderSnap - Glassmorphism UI Manager
 * Handles model inspector, bottom 3D dock, gesture highlight rows,
 * telemetry bars, FPS counter, camera status, toasts, and modals.
 */

export const MODEL_DESCRIPTIONS = {
  human: {
    category: 'ANATOMY & BIOMECHANICS',
    title: 'Human Musculoskeletal & Organs',
    desc: 'Articulated skeleton, clavicle, ribcage, muscular groups & beating heart'
  },
  bike: {
    category: 'VEHICLE SEGMENTATION',
    title: 'Royal Enfield Classic 350',
    desc: 'Teardrop fuel tank, spoked wheels, single-cylinder engine & torpedo silencer'
  },
  car: {
    category: 'VEHICLE SEGMENTATION',
    title: 'BMW M4 Competition Coupe',
    desc: 'S58 Twin-Turbo I6 engine bay cutaway, carbon roof, bucket seats & forged rims'
  },
  plane: {
    category: 'AERODYNAMIC MAPPING',
    title: 'Commercial Airliner A320',
    desc: 'Passenger cabin cutaway, turbofan engine, swept wings with winglets & flight deck'
  }
};

export class UIManager {
  constructor() {
    this.fpsElement = document.getElementById('fps-value');
    this.toastContainer = document.getElementById('toast-container');
    this.loader = document.getElementById('app-loader');
    this.loaderStatus = document.getElementById('loader-status');
    this.errorModal = document.getElementById('error-modal');
    this.errorMessage = document.getElementById('error-message');

    // Model Inspector Card Elements
    this.inspectorCard = document.getElementById('inspector-card');
    this.btnToggleInspector = document.getElementById('btn-toggle-inspector');
    this.modelCategory = document.getElementById('model-category');
    this.modelTitle = document.getElementById('model-title');
    this.modelDesc = document.getElementById('model-desc');
    this.trackingFillBar = document.getElementById('tracking-fill-bar');
    this.telemetryTrackingVal = document.getElementById('telemetry-tracking-val');

    if (this.btnToggleInspector && this.inspectorCard) {
      this.btnToggleInspector.addEventListener('click', () => {
        this.inspectorCard.classList.toggle('collapsed');
        const isCollapsed = this.inspectorCard.classList.contains('collapsed');
        this.btnToggleInspector.textContent = isCollapsed ? '▶' : '◀';
        this.btnToggleInspector.title = isCollapsed ? 'Expand Blueprint Details' : 'Collapse Blueprint Details';
      });
    }

    // Buttons
    this.dockButtons = document.querySelectorAll('.dock-pill-btn');
    this.paletteBtn = document.getElementById('btn-palette');
    this.paletteName = document.getElementById('palette-name');
    this.fullscreenBtn = document.getElementById('btn-fullscreen');
    this.snapshotBtn = document.getElementById('btn-snapshot');
    this.cameraBtn = document.getElementById('btn-camera');
    this.cameraText = document.getElementById('camera-text');

    // Quick action buttons
    this.btnExplode = document.getElementById('btn-action-explode');
    this.btnAssemble = document.getElementById('btn-action-assemble');
    this.btnReset = document.getElementById('btn-action-reset');
    this.btnNext = document.getElementById('btn-action-next');

    // Instruction rows for real-time gesture highlight
    this.instructionRows = {
      'Open Palm': document.querySelector('[data-gesture="open-palm"]'),
      Fist: document.querySelector('[data-gesture="fist"]'),
      Tracking: document.querySelector('[data-gesture="tracking"]'),
      Pinch: document.querySelector('[data-gesture="pinch"]'),
      'Two Hands': document.querySelector('[data-gesture="two-hands"]'),
      'Peace Sign': document.querySelector('[data-gesture="peace"]')
    };

    // FPS measurement
    this.frameCount = 0;
    this.lastFpsTime = performance.now();
    this.currentFps = 60;
  }

  setLoadingStatus(message) {
    if (this.loaderStatus) {
      this.loaderStatus.textContent = message;
    }
  }

  hideLoader() {
    if (this.loader) {
      this.loader.classList.add('hidden');
      setTimeout(() => {
        this.loader.style.display = 'none';
      }, 500);
    }
  }

  showError(message, onRetry, onFallback) {
    if (this.errorModal) {
      this.errorMessage.textContent = message;
      this.errorModal.classList.remove('hidden');

      const retryBtn = document.getElementById('btn-retry-camera');
      const fallbackBtn = document.getElementById('btn-use-fallback');

      if (retryBtn) {
        retryBtn.onclick = () => {
          this.errorModal.classList.add('hidden');
          if (typeof onRetry === 'function') onRetry();
        };
      }

      if (fallbackBtn) {
        fallbackBtn.onclick = () => {
          this.errorModal.classList.add('hidden');
          if (typeof onFallback === 'function') onFallback();
        };
      }
    }
  }

  updateFPS() {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastFpsTime;

    if (elapsed >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / elapsed);
      if (this.fpsElement) {
        this.fpsElement.textContent = `${this.currentFps} FPS`;
      }
      this.frameCount = 0;
      this.lastFpsTime = now;
    }
  }

  updateModelDisplay(modelKey) {
    const info = MODEL_DESCRIPTIONS[modelKey] || {
      category: '3D MODEL',
      title: modelKey,
      desc: 'Interactive 3D particle mesh'
    };

    if (this.modelCategory) this.modelCategory.textContent = info.category;
    if (this.modelTitle) this.modelTitle.textContent = info.title;
    if (this.modelDesc) this.modelDesc.textContent = info.desc;

    // Highlight active dock button
    this.dockButtons.forEach((btn) => {
      if (btn.dataset.model === modelKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  updateGestureStatus(gestureState, isVirtual = false) {
    const { hasHands, activeGesture, isPinching } = gestureState;

    // Update telemetry bar
    const pct = hasHands ? (isVirtual ? 92 : 98) : 25;
    if (this.telemetryTrackingVal) {
      this.telemetryTrackingVal.textContent = `${pct}%`;
    }
    if (this.trackingFillBar) {
      this.trackingFillBar.style.width = `${pct}%`;
    }

    // Clear instruction highlights
    Object.values(this.instructionRows).forEach((el) => {
      if (el) el.classList.remove('active-inst');
    });

    // Highlight active gesture row
    if (activeGesture && this.instructionRows[activeGesture]) {
      this.instructionRows[activeGesture].classList.add('active-inst');
    } else if (isPinching && this.instructionRows['Pinch']) {
      this.instructionRows['Pinch'].classList.add('active-inst');
    } else if (hasHands && this.instructionRows['Tracking']) {
      this.instructionRows['Tracking'].classList.add('active-inst');
    }
  }

  setCameraStatus(active, message = 'Camera Active') {
    if (this.cameraText) {
      this.cameraText.textContent = message;
    }
    if (this.cameraBtn) {
      if (active) {
        this.cameraBtn.style.borderColor = 'rgba(0, 255, 136, 0.4)';
      } else {
        this.cameraBtn.style.borderColor = 'rgba(255, 150, 0, 0.5)';
      }
    }
  }

  updatePaletteDisplay(palette) {
    if (this.paletteName) {
      this.paletteName.textContent = palette.name;
    }
  }

  showToast(message, icon = '✨') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'glass-toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-msg">${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('visible');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 2400);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
}
