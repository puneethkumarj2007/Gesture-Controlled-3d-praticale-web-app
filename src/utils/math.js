/**
 * WonderSnap - Math & Smoothing Utilities
 */

export function clamp(val, min = 0, max = 1) {
  return Math.min(Math.max(val, min), max);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function mapRange(value, inMin, inMax, outMin, outMax) {
  if (Math.abs(inMax - inMin) < 0.00001) return outMin;
  const normalized = (value - inMin) / (inMax - inMin);
  return outMin + normalized * (outMax - outMin);
}

export function dist2D(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

export function dist3D(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.hypot(dx, dy, dz);
}

/**
 * Exponential Moving Average (EMA) smoother for scalar numbers
 */
export class SmoothValue {
  constructor(initial = 0, alpha = 0.25) {
    this.value = initial;
    this.target = initial;
    this.alpha = alpha;
  }

  setTarget(t) {
    this.target = t;
  }

  update(alpha = this.alpha) {
    this.value = lerp(this.value, this.target, alpha);
    return this.value;
  }

  reset(val = 0) {
    this.value = val;
    this.target = val;
  }
}

/**
 * Exponential Moving Average smoother for 2D/3D vectors
 */
export class SmoothVector {
  constructor(x = 0, y = 0, z = 0, alpha = 0.25) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.targetX = x;
    this.targetY = y;
    this.targetZ = z;
    this.alpha = alpha;
  }

  setTarget(x, y, z = 0) {
    this.targetX = x;
    this.targetY = y;
    this.targetZ = z;
  }

  update(alpha = this.alpha) {
    this.x = lerp(this.x, this.targetX, alpha);
    this.y = lerp(this.y, this.targetY, alpha);
    this.z = lerp(this.z, this.targetZ, alpha);
    return { x: this.x, y: this.y, z: this.z };
  }

  reset(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.targetX = x;
    this.targetY = y;
    this.targetZ = z;
  }
}
