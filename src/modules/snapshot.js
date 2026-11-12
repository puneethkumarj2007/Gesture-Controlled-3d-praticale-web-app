/**
 * WonderSnap - Snapshot Compositing & Export Module
 * Composites mirrored video stream, WebGL particle canvas, and sleek watermark into a high-res PNG.
 */

export class SnapshotManager {
  constructor(videoElement, webglCanvas) {
    this.video = videoElement;
    this.webglCanvas = webglCanvas;
    this.isCapturing = false;
    this.onSnapshotStart = null;
    this.onSnapshotComplete = null;
  }

  /**
   * Synthesize an authentic camera shutter sound via Web Audio API (no external audio files needed!)
   */
  playShutterSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Click pulse
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // Audio autoplay policy or unavailable
    }
  }

  /**
   * Trigger screen shutter flash element
   */
  triggerFlash() {
    this.playShutterSound();
    const flashEl = document.getElementById('shutter-flash');
    if (flashEl) {
      flashEl.classList.remove('active');
      void flashEl.offsetWidth; // Force reflow
      flashEl.classList.add('active');
      setTimeout(() => {
        flashEl.classList.remove('active');
      }, 500);
    }
  }

  /**
   * Capture and composite video + WebGL particle canvas into PNG download
   */
  async capture(modeName = 'Galaxy') {
    if (this.isCapturing) return;
    this.isCapturing = true;

    if (typeof this.onSnapshotStart === 'function') {
      this.onSnapshotStart();
    }

    this.triggerFlash();

    try {
      // Determine capture dimensions
      const width = this.video.videoWidth || window.innerWidth;
      const height = this.video.videoHeight || window.innerHeight;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 1. Draw mirrored webcam video
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      if (this.video && this.video.readyState >= 2) {
        ctx.drawImage(this.video, 0, 0, width, height);
      } else {
        // Fallback dark gradient
        ctx.fillStyle = '#0a0d1a';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();

      // 2. Draw Three.js particle canvas
      if (this.webglCanvas) {
        ctx.drawImage(this.webglCanvas, 0, 0, width, height);
      }

      // 3. Render Sleek WonderSnap Watermark HUD
      const now = new Date();
      const dateStr = now.toLocaleDateString();
      const timeStr = now.toLocaleTimeString();

      // Bottom gradient vignette for badge readability
      const grad = ctx.createLinearGradient(0, height - 90, 0, height);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, height - 90, width, 90);

      // Watermark Text
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
      ctx.shadowBlur = 12;
      ctx.fillText('✨ WONDERSNAP', 30, height - 32);

      ctx.font = '500 14px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowBlur = 0;
      ctx.fillText(`Mode: ${modeName}  •  ${dateStr} ${timeStr}`, 210, height - 32);

      // 4. Export as PNG and trigger download
      canvas.toBlob((blob) => {
        if (!blob) {
          this.isCapturing = false;
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `wondersnap_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.png`;

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => {
          URL.revokeObjectURL(url);
          this.isCapturing = false;
          if (typeof this.onSnapshotComplete === 'function') {
            this.onSnapshotComplete(filename);
          }
        }, 1000);
      }, 'image/png');
    } catch (err) {
      console.error('[SnapshotManager] Capture failed:', err);
      this.isCapturing = false;
    }
  }
}
