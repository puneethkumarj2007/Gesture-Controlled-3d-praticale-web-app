/**
 * WonderSnap - Effects & Color Palette Manager
 * Handles mode switching (Galaxy, Fire, Shape Morph) and color palette transitions.
 */

import * as THREE from 'three';

export const EFFECT_MODES = [
  { id: 0, key: 'galaxy', name: 'Galaxy Spiral', description: 'Cosmic celestial disk with Keplerian orbital flow' },
  { id: 1, key: 'fire', name: 'Inferno Flame', description: 'Rising thermal turbulent flame & ember vortex' },
  { id: 2, key: 'morph', name: 'Shape Morph', description: 'Harmonic sacred geometry & hypercube lattice' }
];

export const COLOR_PALETTES = [
  {
    name: 'Cyber Neon',
    colors: ['#00f0ff', '#0055ff', '#ff0077'] // Cyan, Blue, Magenta
  },
  {
    name: 'Solar Flare',
    colors: ['#ffe600', '#ff5100', '#ff1a00'] // Gold, Orange, Crimson
  },
  {
    name: 'Bio Aurora',
    colors: ['#00ffa2', '#00b887', '#00bfff'] // Mint, Emerald, Ice Blue
  },
  {
    name: 'Cosmic Twilight',
    colors: ['#ffffff', '#9b51e0', '#ff3366'] // Starlight, Deep Violet, Hot Rose
  }
];

export class EffectsManager {
  constructor() {
    this.currentModeIndex = 0;
    this.currentPaletteIndex = 0;

    // Target colors for smooth transitions
    this.targetColor1 = new THREE.Color(COLOR_PALETTES[0].colors[0]);
    this.targetColor2 = new THREE.Color(COLOR_PALETTES[0].colors[1]);
    this.targetColor3 = new THREE.Color(COLOR_PALETTES[0].colors[2]);

    // Current interpolated colors passed into shaders
    this.color1 = this.targetColor1.clone();
    this.color2 = this.targetColor2.clone();
    this.color3 = this.targetColor3.clone();

    // Mode interpolation value (for smooth transition into shader)
    this.targetMode = 0.0;
    this.currentMode = 0.0;

    // Listeners
    this.onModeChange = null;
    this.onPaletteChange = null;
  }

  setMode(modeInput) {
    let newIndex = 0;
    if (typeof modeInput === 'number') {
      newIndex = ((modeInput % EFFECT_MODES.length) + EFFECT_MODES.length) % EFFECT_MODES.length;
    } else if (typeof modeInput === 'string') {
      const found = EFFECT_MODES.findIndex((m) => m.key === modeInput.toLowerCase());
      newIndex = found !== -1 ? found : 0;
    }

    this.currentModeIndex = newIndex;
    this.targetMode = newIndex;

    if (typeof this.onModeChange === 'function') {
      this.onModeChange(EFFECT_MODES[newIndex]);
    }
  }

  nextMode() {
    this.setMode(this.currentModeIndex + 1);
  }

  prevMode() {
    this.setMode(this.currentModeIndex - 1);
  }

  setPalette(paletteIndex) {
    this.currentPaletteIndex =
      ((paletteIndex % COLOR_PALETTES.length) + COLOR_PALETTES.length) % COLOR_PALETTES.length;
    const pal = COLOR_PALETTES[this.currentPaletteIndex];

    this.targetColor1.set(pal.colors[0]);
    this.targetColor2.set(pal.colors[1]);
    this.targetColor3.set(pal.colors[2]);

    if (typeof this.onPaletteChange === 'function') {
      this.onPaletteChange(pal, this.currentPaletteIndex);
    }
  }

  nextPalette() {
    this.setPalette(this.currentPaletteIndex + 1);
  }

  update(delta = 0.016) {
    // Smooth lerp colors
    const lerpSpeed = delta * 5.0;
    this.color1.lerp(this.targetColor1, lerpSpeed);
    this.color2.lerp(this.targetColor2, lerpSpeed);
    this.color3.lerp(this.targetColor3, lerpSpeed);

    // Smooth lerp mode uniform
    this.currentMode += (this.targetMode - this.currentMode) * Math.min(1.0, delta * 6.0);
  }

  getCurrentMode() {
    return EFFECT_MODES[this.currentModeIndex];
  }

  getCurrentPalette() {
    return COLOR_PALETTES[this.currentPaletteIndex];
  }
}
