/**
 * WonderSnap - Camera Module
 * Robust webcam stream manager optimized for Google Chrome on Windows.
 * Handles permissions, fallback constraints, and autoplay policies.
 */

export class CameraManager {
  constructor(videoElement) {
    this.video = videoElement;
    this.stream = null;
    this.isReady = false;
    this.onError = null;
    this.onReady = null;
    this.isSimulated = false;
    this._statusCallback = null;

    // Ensure video element attributes for Chrome autoplay
    if (this.video) {
      this.video.muted = true;
      this.video.defaultMuted = true;
      this.video.setAttribute('playsinline', 'true');
      this.video.setAttribute('webkit-playsinline', 'true');
      this.video.setAttribute('autoplay', 'true');
    }

    // Window click resume if browser autoplay policy delays video playback
    window.addEventListener('click', () => {
      if (this.video && this.stream && this.video.paused) {
        this.video.play().catch(() => {});
      }
    }, { passive: true });
  }

  /** Set a status callback for permission-state messages */
  setStatusCallback(fn) {
    this._statusCallback = fn;
  }

  _status(msg) {
    if (typeof this._statusCallback === 'function') this._statusCallback(msg);
  }

  async startCamera() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam API is not available on this connection.');
      }

      this._status('Opening webcam…');

      // Constraints optimized for Windows laptop cameras (HP True Vision, HD Webcams)
      // Do NOT specify facingMode: 'user' as it causes OverconstrainedError on many desktop cams
      const constraintsList = [
        { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
        { video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false },
        { video: true, audio: false }
      ];

      let stream = null;
      let lastErr = null;

      for (const c of constraintsList) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(c);
          if (stream) break;
        } catch (err) {
          lastErr = err;
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            throw err;
          }
          console.warn('[CameraManager] Constraint failed, trying next:', c, err.message);
        }
      }

      if (!stream) {
        throw lastErr || new Error('Could not access any video input device.');
      }

      // Stop previous streams if any
      this.stopCamera();

      this.stream = stream;
      this.video.srcObject = stream;
      this.video.muted = true;
      this.video.defaultMuted = true;
      this.video.playsInline = true;

      // Play video stream
      try {
        await this.video.play();
      } catch (playErr) {
        console.warn('[CameraManager] Autoplay interrupted, will resume on click:', playErr);
      }

      // Wait until video has valid dimensions
      await new Promise((resolve) => {
        if (this.video.videoWidth > 0 && this.video.videoHeight > 0) {
          resolve();
          return;
        }

        let resolved = false;
        const onReady = () => {
          if (resolved) return;
          resolved = true;
          this.video.removeEventListener('loadedmetadata', onReady);
          this.video.removeEventListener('playing', onReady);
          resolve();
        };

        this.video.addEventListener('loadedmetadata', onReady);
        this.video.addEventListener('playing', onReady);

        // Safety timeout
        setTimeout(onReady, 2500);
      });

      this.isReady = true;
      this.isSimulated = false;
      this._status('Webcam Active ✓');

      if (typeof this.onReady === 'function') this.onReady(this.video);
      return true;
    } catch (err) {
      console.warn('[CameraManager] Camera access failed:', err.name, err.message);
      this.isReady = false;

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this._status('Camera permission needed – click Allow in Chrome');
      } else if (err.name === 'NotFoundError') {
        this._status('No webcam found on this computer');
      } else {
        this._status('Camera error: ' + (err.message || err.name));
      }

      if (typeof this.onError === 'function') this.onError(err);
      return false;
    }
  }

  stopCamera() {
    if (this.stream) {
      try {
        this.stream.getTracks().forEach((t) => t.stop());
      } catch (_) {}
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
    this.isReady = false;
  }

  /**
   * Dark cybernetic fallback background when webcam is unavailable.
   */
  startFallbackSimulation() {
    if (this.isReady && !this.isSimulated) return;

    this.stopCamera();
    this.isSimulated = true;

    const simCanvas = document.createElement('canvas');
    simCanvas.width = 1280;
    simCanvas.height = 720;
    const ctx = simCanvas.getContext('2d');

    const draw = () => {
      if (!this.isSimulated) return;
      const t = performance.now() * 0.001;

      // Deep dark sci-fi background
      const grad = ctx.createRadialGradient(640, 360, 60, 640, 360, 720);
      grad.addColorStop(0, '#0c1626');
      grad.addColorStop(1, '#03060c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      // Subtle tech grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1280; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 720);
        ctx.stroke();
      }
      for (let y = 0; y < 720; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1280, y);
        ctx.stroke();
      }

      requestAnimationFrame(draw);
    };

    draw();

    try {
      const stream = simCanvas.captureStream(30);
      this.video.srcObject = stream;
      this.video.play().catch(() => {});
      this.isReady = true;
    } catch (_) {}
  }

  getVideo() {
    return this.video;
  }
}
