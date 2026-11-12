/**
 * WonderSnap - Main Application Orchestrator
 * Connects Camera, MediaPipe HandTracker, GestureEngine, Three.js ParticleScene,
 * EffectsManager, SnapshotManager, and UIManager.
 */

import { CameraManager } from './modules/camera.js';
import { HandTracker } from './modules/handTracker.js';
import { GestureEngine } from './modules/gestures.js';
import { ParticleScene } from './modules/scene.js';
import { EffectsManager } from './modules/effects.js';
import { SnapshotManager } from './modules/snapshot.js';
import { UIManager } from './modules/ui.js';
import { LabelsManager } from './modules/labels.js';

class WonderSnapApp {
  constructor() {
    this.videoElement = document.getElementById('video-bg');
    this.landmarkCanvas = document.getElementById('landmark-canvas');
    this.threeContainer = document.getElementById('three-canvas-container');

    // Modules
    this.ui = new UIManager();
    this.effects = new EffectsManager();
    this.scene = new ParticleScene(this.threeContainer);
    this.labels = new LabelsManager(this.scene.camera);
    this.camera = new CameraManager(this.videoElement);
    this.camera.setStatusCallback((msg) => {
      this.ui.setCameraStatus(this.camera.isReady, msg);
    });
    this.handTracker = new HandTracker(this.landmarkCanvas);
    this.gestures = new GestureEngine();
    this.snapshot = new SnapshotManager(this.videoElement, this.scene.getCanvas());

    // Virtual Cyber Hand & Mouse Tracking state
    this.mouseScreenPos = { x: 0.5, y: 0.5 };
    this.isSimulationMode = false;
    this.simGestureState = {
      hasHands: true,
      handCount: 1,
      activeGesture: 'Tracking',
      pinchDistance: 1.0,
      isPinching: false,
      twoHandDistance: 1.0,
      expand: 0.0,
      collapse: 0.0,
      attractor: { x: 0, y: 0, z: 0 },
      attractorStrength: 1.0
    };

    this.bindEvents();

    // Start render loop immediately so GPU particles and UI animate from frame 0
    this.loop();
  }

  async start() {
    try {
      this.ui.setLoadingStatus('Initializing Three.js Particle Engine...');

      // Load AI Vision in parallel
      this.handTracker
        .init((statusMsg) => {
          this.ui.setLoadingStatus(statusMsg);
        })
        .then(() => {
          console.log('[WonderSnap] Vision model loaded successfully.');
        })
        .catch((err) => {
          console.warn('[WonderSnap] HandLandmarker load warning:', err);
        });

      this.ui.setLoadingStatus('Connecting webcam...');
      const cameraSuccess = await this.camera.startCamera();

      if (!cameraSuccess) {
        this.ui.setCameraStatus(false, 'Enable Camera');
        this._showCameraBanner();
        this.camera.startFallbackSimulation();
        this.ui.showToast('Click "Allow Camera" to track your real hand.', '📷');
      } else {
        this._hideCameraBanner();
        this.ui.setCameraStatus(true, 'Camera Active');
        this.ui.showToast('Webcam active! Raise your hand to interact.', '🖐️');
      }

      // Initialize active 3D Model Display
      this.ui.updateModelDisplay('human');
      this.labels.setModel('human');

      this.ui.hideLoader();
    } catch (err) {
      console.error('[WonderSnap] Startup error:', err);
      this.ui.hideLoader();
      this.ui.updateModelDisplay('human');
      this.labels.setModel('human');
      this.camera.startFallbackSimulation();
      this._showCameraBanner();
    }
  }

  async retryCamera() {
    this.ui.setLoadingStatus('Connecting webcam...');
    const success = await this.camera.startCamera();
    if (success) {
      this.isSimulationMode = false;
      this._hideCameraBanner();
      this.ui.setCameraStatus(true, 'Camera Active');
      this.ui.showToast('Webcam connected! Real-time hand tracking active.', '📷');
    } else {
      this.ui.setCameraStatus(false, 'Enable Camera');
      this._showCameraBanner();
      this.ui.showToast('Camera blocked. Click the lock 🔒 in Chrome address bar to Allow.', '⚠️');
    }
  }

  enableSimulationMode() {
    this.isSimulationMode = true;
    this.camera.startFallbackSimulation();
    this.ui.showToast('Interactive Simulation Mode active! Use mouse and 1/2/3/P/S keys.', '🎮');
  }

  _showCameraBanner() {
    const banner = document.getElementById('camera-banner');
    if (banner) banner.classList.remove('hidden');
  }

  _hideCameraBanner() {
    const banner = document.getElementById('camera-banner');
    if (banner) banner.classList.add('hidden');
  }

  bindEvents() {
    // 3D Model Dock Buttons
    const modelKeys = ['human', 'bike', 'car', 'plane'];
    const modelIndexMap = { human: 2, bike: 0, car: 1, plane: 3 };

    this.ui.dockButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.model;
        const targetIdx = modelIndexMap[key] !== undefined ? modelIndexMap[key] : 0;
        this.scene.setModel(targetIdx);
        this.ui.updateModelDisplay(key);
        this.labels.setModel(key);
        const current = this.scene.getCurrentModel();
        this.ui.showToast(`Morphing into: ${current.name}`, current.icon);
      });
    });

    // Camera Permission Banner Buttons
    const bannerBtn = document.getElementById('camera-banner-btn');
    const bannerDismiss = document.getElementById('camera-banner-dismiss');
    if (bannerBtn) {
      bannerBtn.addEventListener('click', async () => {
        this._hideCameraBanner();
        await this.retryCamera();
        if (!this.camera.isReady) this._showCameraBanner();
      });
    }
    if (bannerDismiss) {
      bannerDismiss.addEventListener('click', () => {
        this._hideCameraBanner();
        this.enableSimulationMode();
      });
    }

    // Inspector Quick Action Buttons
    if (this.ui.btnExplode) {
      this.ui.btnExplode.addEventListener('click', () => {
        this.simGestureState.expand = 1.0;
        this.simGestureState.collapse = 0.0;
        this.simGestureState.activeGesture = 'Open Palm';
        this.ui.showToast('Exploded Assembly View', '💥');
        setTimeout(() => {
          this.simGestureState.expand = 0.0;
          this.simGestureState.activeGesture = 'Tracking';
        }, 1800);
      });
    }

    if (this.ui.btnAssemble) {
      this.ui.btnAssemble.addEventListener('click', () => {
        this.simGestureState.collapse = 1.0;
        this.simGestureState.expand = 0.0;
        this.simGestureState.activeGesture = 'Fist';
        this.ui.showToast('Assembling Model Core', '✊');
        setTimeout(() => {
          this.simGestureState.collapse = 0.0;
          this.simGestureState.activeGesture = 'Tracking';
        }, 1800);
      });
    }

    if (this.ui.btnReset) {
      this.ui.btnReset.addEventListener('click', () => {
        this.scene.smoothRotX = 0;
        this.scene.smoothRotY = 0;
        this.scene.targetRotX = 0;
        this.scene.targetRotY = 0;
        this.simGestureState.pinchDistance = 1.0;
        this.simGestureState.expand = 0.0;
        this.simGestureState.collapse = 0.0;
        this.ui.showToast('3D View Reset', '🔄');
      });
    }

    if (this.ui.btnNext) {
      this.ui.btnNext.addEventListener('click', () => {
        this.scene.nextModel();
        const current = this.scene.getCurrentModel();
        this.ui.updateModelDisplay(current.key);
        this.labels.setModel(current.key);
        this.ui.showToast(`3D Model: ${current.name}`, current.icon);
      });
    }

    // Camera Access Button
    if (this.ui.cameraBtn) {
      this.ui.cameraBtn.addEventListener('click', async () => {
        this.ui.showToast('Accessing webcam...', '📷');
        await this.retryCamera();
      });
    }

    // Palette Button
    if (this.ui.paletteBtn) {
      this.ui.paletteBtn.addEventListener('click', () => {
        this.cyclePalette();
      });
    }

    // Snapshot Button
    if (this.ui.snapshotBtn) {
      this.ui.snapshotBtn.addEventListener('click', () => {
        this.triggerSnapshot();
      });
    }

    // Fullscreen Button
    if (this.ui.fullscreenBtn) {
      this.ui.fullscreenBtn.addEventListener('click', () => {
        this.ui.toggleFullscreen();
      });
    }

    // Hand Mode Toggle (Camera Hand vs Virtual Cyber Hand)
    const toggleHandBtn = document.getElementById('btn-toggle-hand');
    const toggleHandAction = () => {
      this.isSimulationMode = !this.isSimulationMode;
      const icon = document.getElementById('hand-mode-icon');
      const label = document.getElementById('hand-mode-label');

      if (this.isSimulationMode) {
        if (icon) icon.textContent = '🎮';
        if (label) label.textContent = 'Hand: Virtual';
        this.camera.startFallbackSimulation();
        this.ui.showToast('Virtual Cyber Hand active! Move cursor, click to Fist.', '✋');
      } else {
        if (icon) icon.textContent = '📷';
        if (label) label.textContent = 'Hand: Camera';
        this.camera.startCamera();
        this.ui.showToast('Camera Hand Tracking active! Show your hand to webcam.', '📷');
      }
    };

    if (toggleHandBtn) toggleHandBtn.addEventListener('click', toggleHandAction);

    // Gesture: Swipe Left / Right -> Switch 3D Model
    this.gestures.onSwipe = (direction) => {
      if (direction === 'right') {
        this.scene.nextModel();
      } else {
        this.scene.prevModel();
      }
      const model = this.scene.getCurrentModel();
      this.ui.updateModelDisplay(model.key);
      this.labels.setModel(model.key);
      this.ui.showToast(`Swiped ${direction}! ${model.name}`, model.icon);
    };

    // Gesture: Peace Sign -> Jump to Next Model (matching reference guide)
    this.gestures.onPeaceSign = () => {
      this.scene.nextModel();
      const model = this.scene.getCurrentModel();
      this.ui.updateModelDisplay(model.key);
      this.labels.setModel(model.key);
      this.ui.showToast(`Peace sign! Next: ${model.name}`, model.icon);
    };

    // Gesture: Thumbs Up -> Capture Snapshot
    this.gestures.onThumbsUp = () => {
      this.triggerSnapshot();
    };

    // Snapshot complete callback
    this.snapshot.onSnapshotComplete = (filename) => {
      this.ui.showToast(`Snapshot captured: ${filename}`, '📸');
    };

    // Simulation / Mouse & Keyboard fallback controls
    this.setupSimulationControls();
  }

  cyclePalette() {
    this.effects.nextPalette();
    const pal = this.effects.getCurrentPalette();
    this.ui.updatePaletteDisplay(pal);
    this.ui.showToast(`Palette: ${pal.name}`, '🎨');
  }

  triggerSnapshot() {
    const mode = this.effects.getCurrentMode();
    this.snapshot.capture(mode.name);
  }

  setupSimulationControls() {
    const updatePointer = (clientX, clientY) => {
      this.mouseScreenPos.x = clientX / window.innerWidth;
      this.mouseScreenPos.y = clientY / window.innerHeight;

      const aspect = window.innerWidth / window.innerHeight;
      const ndcX = (clientX / window.innerWidth - 0.5) * 5.2 * aspect;
      const ndcY = -(clientY / window.innerHeight - 0.5) * 5.2;

      this.simGestureState.attractor.x = ndcX;
      this.simGestureState.attractor.y = ndcY;
      this.simGestureState.attractorStrength = 1.0;
    };

    // Mouse movement maps to particle attractor
    window.addEventListener('mousemove', (e) => {
      updatePointer(e.clientX, e.clientY);
    });

    // Touch support for mobile/touchscreens
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Mouse click down = Fist collapse
    window.addEventListener('mousedown', (e) => {
      if (e.target.closest('.interactive')) return;
      if (e.button === 0) {
        this.simGestureState.collapse = 1.0;
        this.simGestureState.expand = 0.0;
        this.simGestureState.activeGesture = 'Fist';
      } else if (e.button === 2) {
        this.simGestureState.expand = 1.0;
        this.simGestureState.collapse = 0.0;
        this.simGestureState.activeGesture = 'Open Palm';
      }
    });

    window.addEventListener('mouseup', () => {
      this.simGestureState.collapse = 0.0;
      this.simGestureState.expand = 0.0;
      this.simGestureState.activeGesture = 'Tracking';
    });

    // Mouse scroll = Pinch scale
    window.addEventListener(
      'wheel',
      (e) => {
        if (e.target.closest('.interactive')) return;
        this.simGestureState.pinchDistance = Math.min(
          Math.max(this.simGestureState.pinchDistance + e.deltaY * -0.0015, 0.1),
          1.5
        );
        this.simGestureState.isPinching = this.simGestureState.pinchDistance < 0.35;
        this.simGestureState.activeGesture = 'Pinch';
        clearTimeout(this.pinchTimeout);
        this.pinchTimeout = setTimeout(() => {
          this.simGestureState.activeGesture = 'Tracking';
          this.simGestureState.isPinching = false;
        }, 600);
      },
      { passive: true }
    );

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === '1') {
        this.scene.setModel(2); // Human
        const m = this.scene.getCurrentModel();
        this.ui.updateModelDisplay(m.key);
        this.labels.setModel(m.key);
        this.ui.showToast(`Model: ${m.name}`, m.icon);
      } else if (e.key === '2') {
        this.scene.setModel(0); // Bike
        const m = this.scene.getCurrentModel();
        this.ui.updateModelDisplay(m.key);
        this.labels.setModel(m.key);
        this.ui.showToast(`Model: ${m.name}`, m.icon);
      } else if (e.key === '3') {
        this.scene.setModel(1); // Car
        const m = this.scene.getCurrentModel();
        this.ui.updateModelDisplay(m.key);
        this.labels.setModel(m.key);
        this.ui.showToast(`Model: ${m.name}`, m.icon);
      } else if (e.key === '4') {
        this.scene.setModel(3); // Plane
        const m = this.scene.getCurrentModel();
        this.ui.updateModelDisplay(m.key);
        this.labels.setModel(m.key);
        this.ui.showToast(`Model: ${m.name}`, m.icon);
      } else if (e.key.toLowerCase() === 'p') {
        this.cyclePalette();
      } else if (e.key.toLowerCase() === 's' || e.code === 'Space') {
        e.preventDefault();
        this.triggerSnapshot();
      } else if (e.key.toLowerCase() === 'f') {
        this.ui.toggleFullscreen();
      } else if (e.key === 'ArrowRight') {
        this.scene.nextModel();
        const m = this.scene.getCurrentModel();
        this.ui.updateModelDisplay(m.key);
        this.labels.setModel(m.key);
        this.ui.showToast(`Model: ${m.name}`, m.icon);
      } else if (e.key === 'ArrowLeft') {
        this.scene.prevModel();
        const m = this.scene.getCurrentModel();
        this.ui.updateModelDisplay(m.key);
        this.labels.setModel(m.key);
        this.ui.showToast(`Model: ${m.name}`, m.icon);
      }
    });

    window.addEventListener('contextmenu', (e) => {
      if (!e.target.closest('input, textarea')) {
        e.preventDefault();
      }
    });
  }

  loop = () => {
    requestAnimationFrame(this.loop);

    let gestureState = null;
    let isVirtual = false;
    const vw = this.videoElement.videoWidth || window.innerWidth;
    const vh = this.videoElement.videoHeight || window.innerHeight;

    const hasLiveCamera = this.camera.isReady && !this.camera.isSimulated && this.videoElement.readyState >= 2;

    if (hasLiveCamera && !this.isSimulationMode) {
      // 1. MediaPipe Real-Time Inference on physical webcam
      const results = this.handTracker.detect(this.videoElement);

      if (results && results.landmarks && results.landmarks.length > 0) {
        // Physical hand actively detected in camera stream
        this.handTracker.drawOverlay(results, vw, vh);
        const aspect = window.innerWidth / window.innerHeight;
        gestureState = this.gestures.update(results, aspect);
        isVirtual = false;
      } else {
        // Physical hand temporarily out of frame -> smooth fallback cursor
        const vHand = this.handTracker.generateVirtualHand(
          this.mouseScreenPos.x,
          this.mouseScreenPos.y,
          this.simGestureState
        );
        this.handTracker.drawOverlay({ landmarks: [vHand] }, vw, vh);
        gestureState = this.simGestureState;
        isVirtual = true;
      }
    } else {
      // Virtual mode or camera starting -> active cybernetic hand
      const vHand = this.handTracker.generateVirtualHand(
        this.mouseScreenPos.x,
        this.mouseScreenPos.y,
        this.simGestureState
      );
      this.handTracker.drawOverlay({ landmarks: [vHand] }, vw, vh);
      gestureState = this.simGestureState;
      isVirtual = true;
    }

    // 4. Update Three.js GPU Particle Scene
    this.scene.update(gestureState, this.effects);

    // 4b. Update 3D Holographic Callout Labels with dynamic tracking
    if (this.labels) {
      this.labels.update(
        this.scene.smoothRotX,
        this.scene.smoothRotY,
        this.scene.clock.getElapsedTime()
      );
    }

    // 5. Update UI HUD and FPS
    this.ui.updateFPS();
    if (gestureState) {
      this.ui.updateGestureStatus(gestureState, isVirtual);
    }
  };
}

// Robust Application bootstrap
function bootstrap() {
  const app = new WonderSnapApp();
  app.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
