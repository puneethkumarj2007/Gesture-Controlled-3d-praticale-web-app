/**
 * WonderSnap - Gesture Recognition Engine
 * Detects: Open Palm, Fist, Pinch (continuous 0-1), Two-Hand Distance,
 * Swipe Left/Right, Peace Sign, Thumbs Up.
 * Features Exponential Moving Average (EMA) smoothing and hysteresis debouncing.
 */

import { dist2D, dist3D, clamp, lerp, SmoothValue, SmoothVector } from '../utils/math.js';

export class GestureEngine {
  constructor() {
    // Smoothed values
    this.smoothedPinch = new SmoothValue(1.0, 0.25);
    this.smoothedStretch = new SmoothValue(1.0, 0.2);
    this.smoothedAttractor = new SmoothVector(0, 0, 0, 0.22);
    this.smoothedExpand = new SmoothValue(0.0, 0.2);
    this.smoothedCollapse = new SmoothValue(0.0, 0.2);

    // Position history for swipe detection (buffer of { x, y, time })
    this.positionHistory = [];
    this.historyDurationMs = 320;

    // Debounce / Cooldown timestamps (initialized to past so immediate trigger is allowed)
    this.lastSwipeTime = -10000;
    this.swipeCooldownMs = 650;

    this.lastPeaceTime = -10000;
    this.peaceCooldownMs = 900;

    this.lastThumbsUpTime = -10000;
    this.thumbsUpCooldownMs = 3500;

    // Callbacks
    this.onSwipe = null;         // ('left' | 'right')
    this.onPeaceSign = null;     // ()
    this.onThumbsUp = null;      // ()
    this.onGestureChange = null; // (gestureName)
    
    this.activeGestureName = 'None';
  }

  /**
   * Process landmarks from HandTracker
   * @param {Object} results - MediaPipe HandLandmarker results
   * @param {number} aspect - Camera aspect ratio for 3D projection
   */
  update(results, aspect = 16 / 9) {
    const now = performance.now();
    const hasHands = results && results.landmarks && results.landmarks.length > 0;

    if (!hasHands) {
      // Smoothly relax to neutral idle state
      this.smoothedPinch.setTarget(1.0);
      this.smoothedStretch.setTarget(1.0);
      this.smoothedExpand.setTarget(0.0);
      this.smoothedCollapse.setTarget(0.0);
      this.smoothedAttractor.setTarget(0, 0, 0);

      this.smoothedPinch.update();
      this.smoothedStretch.update();
      this.smoothedExpand.update();
      this.smoothedCollapse.update();
      this.smoothedAttractor.update(0.05);

      this.positionHistory = [];
      this.activeGestureName = 'None';

      return {
        hasHands: false,
        handCount: 0,
        activeGesture: 'None',
        pinchDistance: this.smoothedPinch.value,
        isPinching: false,
        twoHandDistance: this.smoothedStretch.value,
        expand: this.smoothedExpand.value,
        collapse: this.smoothedCollapse.value,
        attractor: { x: this.smoothedAttractor.x, y: this.smoothedAttractor.y, z: this.smoothedAttractor.z },
        attractorStrength: 0.0
      };
    }

    const handCount = results.landmarks.length;
    const hand1 = results.landmarks[0];
    const hand2 = handCount > 1 ? results.landmarks[1] : null;

    // Analyze primary hand
    const handInfo = this.analyzeHand(hand1);

    // Map screen coordinates to Three.js world space (accounting for mirrored view)
    // In mirrored display: user moves right -> visual moves right -> mirrored X = (1.0 - hand1[0].x)
    const mirroredX = (1.0 - handInfo.palmCenter.x - 0.5) * 5.2 * aspect;
    const mirroredY = -(handInfo.palmCenter.y - 0.5) * 5.2;
    const depthZ = (handInfo.palmCenter.z || 0) * -3.0;

    this.smoothedAttractor.setTarget(mirroredX, mirroredY, depthZ);
    this.smoothedAttractor.update();

    // 1. Pinch distance (Thumb Tip 4 to Index Tip 8)
    const rawPinch = dist3D(hand1[4], hand1[8]);
    const palmSize = handInfo.palmSize || 0.2;
    // Normalized pinch: 0 = tight pinch, 1 = open
    const normPinch = clamp((rawPinch / palmSize - 0.16) / (0.75 - 0.16), 0.0, 1.0);
    this.smoothedPinch.setTarget(normPinch);
    this.smoothedPinch.update();
    const isPinching = normPinch < 0.18;

    // 2. Two-Hand Distance
    if (hand2) {
      const center2 = this.getPalmCenter(hand2);
      const handsDist = dist2D(handInfo.palmCenter, center2);
      // Map ~0.15 to 0.75 distance to 0.5 to 2.4 stretch factor
      const stretchTarget = clamp(handsDist / 0.38, 0.4, 2.5);
      this.smoothedStretch.setTarget(stretchTarget);
    } else {
      this.smoothedStretch.setTarget(1.0);
    }
    this.smoothedStretch.update();

    // 3. Gesture Classification
    let detectedGesture = 'None';

    // Check Thumbs Up first
    const isThumbsUp = this.checkThumbsUp(hand1, handInfo);
    // Check Peace Sign
    const isPeaceSign = this.checkPeaceSign(hand1, handInfo);
    // Check Fist
    const isFist = handInfo.curledCount === 4 && handInfo.thumbCurled;
    // Check Open Palm
    const isOpenPalm = handInfo.extendedCount >= 4 && !isPinching;

    if (isThumbsUp) {
      detectedGesture = 'Thumbs Up';
      if (now - this.lastThumbsUpTime > this.thumbsUpCooldownMs) {
        this.lastThumbsUpTime = now;
        if (typeof this.onThumbsUp === 'function') {
          this.onThumbsUp();
        }
      }
    } else if (isPeaceSign) {
      detectedGesture = 'Peace Sign';
      if (now - this.lastPeaceTime > this.peaceCooldownMs) {
        this.lastPeaceTime = now;
        if (typeof this.onPeaceSign === 'function') {
          this.onPeaceSign();
        }
      }
    } else if (isFist) {
      detectedGesture = 'Fist';
      this.smoothedCollapse.setTarget(1.0);
      this.smoothedExpand.setTarget(0.0);
    } else if (isOpenPalm) {
      detectedGesture = 'Open Palm';
      this.smoothedExpand.setTarget(1.0);
      this.smoothedCollapse.setTarget(0.0);
    } else if (isPinching) {
      detectedGesture = 'Pinch';
      this.smoothedExpand.setTarget(0.0);
      this.smoothedCollapse.setTarget(0.0);
    } else {
      detectedGesture = 'Tracking';
      this.smoothedExpand.setTarget(0.0);
      this.smoothedCollapse.setTarget(0.0);
    }

    this.smoothedExpand.update();
    this.smoothedCollapse.update();

    // 4. Swipe Detection
    this.trackSwipe(handInfo.palmCenter, now);

    this.activeGestureName = detectedGesture;

    return {
      hasHands: true,
      handCount,
      activeGesture: detectedGesture,
      pinchDistance: this.smoothedPinch.value,
      isPinching,
      twoHandDistance: this.smoothedStretch.value,
      expand: this.smoothedExpand.value,
      collapse: this.smoothedCollapse.value,
      attractor: { x: this.smoothedAttractor.x, y: this.smoothedAttractor.y, z: this.smoothedAttractor.z },
      attractorStrength: 1.0
    };
  }

  getPalmCenter(landmarks) {
    // Average of wrist (0) and middle MCP (9)
    return {
      x: (landmarks[0].x + landmarks[9].x) * 0.5,
      y: (landmarks[0].y + landmarks[9].y) * 0.5,
      z: ((landmarks[0].z || 0) + (landmarks[9].z || 0)) * 0.5
    };
  }

  analyzeHand(landmarks) {
    const wrist = landmarks[0];
    const palmCenter = this.getPalmCenter(landmarks);
    const palmSize = dist3D(wrist, landmarks[9]);

    // Check finger extensions:
    // [tip, pip, mcp]
    const fingerRays = [
      { name: 'index', tip: 8, pip: 6, mcp: 5 },
      { name: 'middle', tip: 12, pip: 10, mcp: 9 },
      { name: 'ring', tip: 16, pip: 14, mcp: 13 },
      { name: 'pinky', tip: 20, pip: 18, mcp: 17 }
    ];

    let extendedCount = 0;
    let curledCount = 0;
    const fingerState = {};

    fingerRays.forEach((f) => {
      const tipWristDist = dist3D(landmarks[f.tip], wrist);
      const pipWristDist = dist3D(landmarks[f.pip], wrist);
      const tipMcpDist = dist3D(landmarks[f.tip], landmarks[f.mcp]);
      const pipMcpDist = dist3D(landmarks[f.pip], landmarks[f.mcp]);

      const isExtended = tipWristDist > pipWristDist * 1.1 && tipMcpDist > pipMcpDist * 1.05;
      const isCurled = tipWristDist < pipWristDist * 1.05 || tipMcpDist < pipMcpDist * 0.95;

      fingerState[f.name] = { extended: isExtended, curled: isCurled };
      if (isExtended) extendedCount++;
      if (isCurled) curledCount++;
    });

    // Thumb check
    const thumbTip = landmarks[4];
    const thumbMcp = landmarks[2];
    const indexMcp = landmarks[5];
    const thumbDistToIndex = dist3D(thumbTip, indexMcp);
    const thumbCurled = thumbDistToIndex < palmSize * 0.42;

    return {
      palmCenter,
      palmSize,
      extendedCount,
      curledCount,
      fingerState,
      thumbCurled
    };
  }

  checkThumbsUp(landmarks, handInfo) {
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const thumbMcp = landmarks[2];
    const wrist = landmarks[0];

    // In image space: Y increases downward. For thumb to point UP, Y must be smaller.
    const thumbPointingUp = thumbTip.y < thumbIp.y && thumbIp.y < thumbMcp.y;
    const thumbVertical = Math.abs(thumbTip.y - wrist.y) > Math.abs(thumbTip.x - wrist.x) * 1.2;
    const thumbElevated = thumbTip.y < wrist.y - handInfo.palmSize * 0.5;

    // Other 4 fingers must be tucked/curled into a fist
    const othersCurled = handInfo.curledCount >= 3;

    return thumbPointingUp && thumbVertical && thumbElevated && othersCurled;
  }

  checkPeaceSign(landmarks, handInfo) {
    const { fingerState } = handInfo;
    const indexExtended = fingerState.index.extended;
    const middleExtended = fingerState.middle.extended;
    const ringCurled = fingerState.ring.curled;
    const pinkyCurled = fingerState.pinky.curled;

    if (!indexExtended || !middleExtended || !ringCurled || !pinkyCurled) {
      return false;
    }

    // Spread between index tip (8) and middle tip (12)
    const spread = dist3D(landmarks[8], landmarks[12]);
    return spread > handInfo.palmSize * 0.12;
  }

  trackSwipe(palmCenter, now) {
    this.positionHistory.push({
      x: palmCenter.x,
      y: palmCenter.y,
      time: now
    });

    // Prune history
    this.positionHistory = this.positionHistory.filter((p) => now - p.time < this.historyDurationMs);

    if (this.positionHistory.length < 5 || now - this.lastSwipeTime < this.swipeCooldownMs) {
      return;
    }

    const first = this.positionHistory[0];
    const last = this.positionHistory[this.positionHistory.length - 1];
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const dt = (last.time - first.time) * 0.001; // seconds

    if (dt < 0.08) return;

    const velocityX = dx / dt;
    // Ensure dominant horizontal movement
    if (Math.abs(dx) > 0.18 && Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(velocityX) > 0.8) {
      this.lastSwipeTime = now;
      this.positionHistory = [];

      // Note on mirrored coordinate system:
      // When user physically moves hand right, in mirrored camera view, x moves right,
      // but in raw camera coordinate, x decreases (since raw webcam is unmirrored).
      // So raw dx < 0 means user moved hand right visually!
      const direction = dx < 0 ? 'right' : 'left';

      if (typeof this.onSwipe === 'function') {
        this.onSwipe(direction);
      }
    }
  }
}
