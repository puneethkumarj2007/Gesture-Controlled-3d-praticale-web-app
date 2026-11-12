/**
 * WonderSnap - HandTracker Module
 * Loads MediaPipe HandLandmarker, runs real-time detection for up to 2 hands,
 * and renders a subtle glowing cybernetic landmark overlay.
 */

import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

// Standard 21 Hand Landmark connections
export const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [9, 10], [10, 11], [11, 12],
  // Ring finger
  [13, 14], [14, 15], [15, 16],
  // Pinky finger
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm knuckle base
  [5, 9], [9, 13], [13, 17]
];

export class HandTracker {
  constructor(canvasOverlayElement) {
    this.canvas = canvasOverlayElement;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.landmarker = null;
    this.isLoaded = false;
    this.lastVideoTime = -1;
    this.latestResults = null;
  }

  async init(onProgress) {
    try {
      if (typeof onProgress === 'function') onProgress('Loading vision engine...');

      let vision;
      try {
        // Try local wasm first for instantaneous loading
        vision = await FilesetResolver.forVisionTasks('/wasm');
      } catch (localWasmErr) {
        console.warn('[HandTracker] Local wasm failed, using CDN fallback:', localWasmErr);
        vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        );
      }

      if (typeof onProgress === 'function') onProgress('Loading HandLandmarker model...');

      const localModelPath = '/models/hand_landmarker.task';
      const cdnModelPath =
        'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

      try {
        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: localModelPath,
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.35,
          minHandPresenceConfidence: 0.35,
          minTrackingConfidence: 0.35
        });
      } catch (gpuErr) {
        console.warn('[HandTracker] GPU delegate failed, falling back to CPU / CDN:', gpuErr);
        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: localModelPath,
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.35,
          minHandPresenceConfidence: 0.35,
          minTrackingConfidence: 0.35
        });
      }

      this.isLoaded = true;
      if (typeof onProgress === 'function') onProgress('Vision engine ready');
      return true;
    } catch (err) {
      console.error('[HandTracker] Initialization error:', err);
      // Try pure CPU + CDN fallback
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        );
        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.35,
          minHandPresenceConfidence: 0.35,
          minTrackingConfidence: 0.35
        });
        this.isLoaded = true;
        return true;
      } catch (finalErr) {
        console.error('[HandTracker] All fallbacks exhausted:', finalErr);
        throw finalErr;
      }
    }
  }

  detect(videoElement) {
    if (!this.isLoaded || !this.landmarker || !videoElement || videoElement.readyState < 2) {
      return null;
    }

    const now = performance.now();
    // MediaPipe VIDEO mode requires strictly monotonically increasing timestamp
    if (now <= this.lastVideoTime) {
      return this.latestResults;
    }

    try {
      this.lastVideoTime = now;
      this.latestResults = this.landmarker.detectForVideo(videoElement, now);
    } catch (e) {
      console.warn('[HandTracker] Detection error:', e);
    }

    return this.latestResults;
  }

  /**
   * Draw subtle, high-aesthetic glowing cybernetic overlay
   */
  drawOverlay(results, videoWidth, videoHeight) {
    if (!this.ctx || !this.canvas) return;

    if (this.canvas.width !== videoWidth || this.canvas.height !== videoHeight) {
      this.canvas.width = videoWidth;
      this.canvas.height = videoHeight;
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (!results || !results.landmarks || results.landmarks.length === 0) {
      return;
    }

    const t = performance.now() * 0.003;

    results.landmarks.forEach((landmarks, handIndex) => {
      const isFirstHand = handIndex === 0;

      // Calculate Palm Center & Hand Span Radius
      const wrist = landmarks[0];
      const middleMcp = landmarks[9];
      const middleTip = landmarks[12];

      const centerX = ((wrist.x + middleMcp.x) * 0.5) * this.canvas.width;
      const centerY = ((wrist.y + middleMcp.y) * 0.5) * this.canvas.height;
      
      const tipX = middleTip.x * this.canvas.width;
      const tipY = middleTip.y * this.canvas.height;
      const haloRadius = Math.max(Math.hypot(tipX - centerX, tipY - centerY) * 1.15, 75);

      // -------------------------------------------------------------
      // 1. Golden Glowing Circular Halo Ring (Matching User Reference Image)
      // -------------------------------------------------------------
      ctx.save();
      ctx.shadowColor = 'rgba(255, 215, 40, 0.8)';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 2.8;
      ctx.strokeStyle = 'rgba(255, 225, 60, 0.9)';

      ctx.beginPath();
      ctx.arc(centerX, centerY, haloRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Delicate outer rotating dashed reticle
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(255, 225, 60, 0.4)';
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, haloRadius + 8, t * 1.5, t * 1.5 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // -------------------------------------------------------------
      // 2. Cybernetic Hand Bones
      // -------------------------------------------------------------
      ctx.lineWidth = 2.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      HAND_CONNECTIONS.forEach(([i, j]) => {
        const p1 = landmarks[i];
        const p2 = landmarks[j];
        if (!p1 || !p2) return;

        const x1 = p1.x * this.canvas.width;
        const y1 = p1.y * this.canvas.height;
        const x2 = p2.x * this.canvas.width;
        const y2 = p2.y * this.canvas.height;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // -------------------------------------------------------------
      // 3. Glowing Joint Nodes
      // -------------------------------------------------------------
      landmarks.forEach((pt, idx) => {
        const x = pt.x * this.canvas.width;
        const y = pt.y * this.canvas.height;

        const isTip = [4, 8, 12, 16, 20].includes(idx);
        const radius = isTip ? 4.5 : 2.8;

        if (isTip) {
          const pulse = (Math.sin(t * 4.0 + idx) + 1.0) * 0.5;
          ctx.beginPath();
          ctx.arc(x, y, radius + pulse * 4.0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(120, 220, 255, ' + (0.4 + pulse * 0.4) + ')';
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isTip ? '#ffffff' : 'rgba(200, 220, 255, 0.9)';
        ctx.fill();
      });
    });
  }

  /**
   * Generates a 21-point virtual hand skeleton at screen coordinates (normX, normY)
   * conforming to the active gesture state (Open Palm, Fist, Pinch, etc.)
   */
  generateVirtualHand(normX, normY, gestureState = {}) {
    const isFist = gestureState.collapse > 0.5 || gestureState.activeGesture === 'Fist';
    const isOpen = gestureState.expand > 0.5 || gestureState.activeGesture === 'Open Palm';
    const pinch = gestureState.pinchDistance !== undefined ? gestureState.pinchDistance : 1.0;

    const scale = isOpen ? 1.3 : isFist ? 0.65 : 1.0;
    const baseW = 0.09 * scale;
    const baseH = 0.13 * scale;
    const curl = isFist ? 0.35 : 1.0;

    const landmarks = new Array(21);
    landmarks[0] = { x: normX, y: normY + baseH * 0.5, z: 0 };

    // Thumb: 1, 2, 3, 4
    const thumbPinch = Math.min(pinch, 1.0);
    landmarks[1] = { x: normX - baseW * 0.4, y: normY + baseH * 0.35, z: 0 };
    landmarks[2] = { x: normX - baseW * 0.65, y: normY + baseH * 0.15, z: 0 };
    landmarks[3] = { x: normX - baseW * 0.8 * thumbPinch, y: normY - baseH * 0.05, z: 0 };
    landmarks[4] = {
      x: isFist ? normX - baseW * 0.2 : normX - baseW * (0.15 + 0.85 * thumbPinch),
      y: isFist ? normY + baseH * 0.1 : normY - baseH * (0.2 + 0.3 * thumbPinch),
      z: 0
    };

    // Fingers: index, middle, ring, pinky
    const fingerCols = [
      { mcp: 5, tip: 8, xOffset: -0.3, len: 1.0 },
      { mcp: 9, tip: 12, xOffset: 0.0, len: 1.15 },
      { mcp: 13, tip: 16, xOffset: 0.28, len: 1.05 },
      { mcp: 17, tip: 20, xOffset: 0.55, len: 0.85 }
    ];

    fingerCols.forEach(({ mcp, tip, xOffset, len }) => {
      const fx = normX + baseW * xOffset;
      landmarks[mcp] = { x: fx, y: normY, z: 0 };
      landmarks[mcp + 1] = { x: fx, y: normY - baseH * 0.35 * len * curl, z: 0 };
      landmarks[mcp + 2] = { x: fx, y: normY - baseH * 0.65 * len * curl, z: 0 };
      landmarks[tip] = { x: fx, y: normY - baseH * 0.95 * len * curl, z: 0 };
    });

    if (gestureState.isPinching) {
      landmarks[8].x = landmarks[4].x;
      landmarks[8].y = landmarks[4].y;
    }

    return landmarks;
  }
}
