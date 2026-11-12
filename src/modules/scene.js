/**
 * WonderSnap - Three.js WebGL Scene & 3D Particle Model Engine
 * Renders 16,384 GPU particles with 4 interactive 3D models:
 * 1. Royal Enfield Bike
 * 2. BMW Sports Car
 * 3. Human Anatomical Skeleton
 * 4. Supersonic Aeroplane
 */

import * as THREE from 'three';
import { particleVertexShader, particleFragmentShader } from '../shaders/particleShaders.js';
import {
  generateBikePoints,
  generateCarPoints,
  generateHumanPoints,
  generatePlanePoints,
  MODEL_COUNT
} from '../models/modelGenerators.js';

export const MODELS = [
  { id: 0, key: 'bike', name: 'Royal Enfield Classic 350', category: 'Vehicle Segmentation', icon: '🏍️' },
  { id: 1, key: 'car', name: 'BMW M4 Competition Coupe', category: 'Vehicle Segmentation', icon: '🏎️' },
  { id: 2, key: 'human', name: 'Human Musculoskeletal & Organs', category: 'Anatomy Mapping', icon: '🧬' },
  { id: 3, key: 'plane', name: 'Commercial Airliner A320', category: 'Aerodynamic Mapping', icon: '✈️' }
];

export class ParticleScene {
  constructor(containerElement) {
    this.container = containerElement;
    this.particleCount = MODEL_COUNT;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    // Center the 3D model directly over the user's upper body / chest
    this.camera.position.set(0.0, 0.45, 4.4);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Blueprint 3D perspective floor grid (matches reference blueprint images)
    const grid = new THREE.GridHelper(18, 36, 0x00f0ff, 0x06334a);
    grid.position.y = -1.70;
    if (grid.material) {
      grid.material.opacity = 0.38;
      grid.material.transparent = true;
    }
    this.scene.add(grid);

    // Subtle 3D origin axis lines on floor
    const axisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-9, -1.69, 0),
      new THREE.Vector3(9, -1.69, 0),
      new THREE.Vector3(0, -1.69, -9),
      new THREE.Vector3(0, -1.69, 9)
    ]);
    const axisMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, opacity: 0.28, transparent: true });
    this.scene.add(new THREE.LineSegments(axisGeo, axisMat));

    this.clock = new THREE.Clock();
    this.particles = null;
    this.material = null;

    // Morph state
    this.currentModelIndex = 2; // Default: Human Skeleton (matching reference screenshot)
    this.targetModelIndex = 2;
    this.morphProgress = 1.0;
    this.morphSpeed = 2.4;

    // Hand-driven tilt smoothing
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.smoothRotX = 0;
    this.smoothRotY = 0;

    this.initParticles();
    this.setupResizeListener();
  }

  initParticles() {
    const count = this.particleCount;
    const geometry = new THREE.BufferGeometry();

    // Generate high-density 3D particle coordinate arrays
    const bikePoints = generateBikePoints(count);
    const carPoints = generateCarPoints(count);
    const humanPoints = generateHumanPoints(count);
    const planePoints = generatePlanePoints(count);

    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      seeds[i] = Math.random();
    }

    // Assign attributes
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute('aBike', new THREE.BufferAttribute(bikePoints, 3));
    geometry.setAttribute('aCar', new THREE.BufferAttribute(carPoints, 3));
    geometry.setAttribute('aHuman', new THREE.BufferAttribute(humanPoints, 3));
    geometry.setAttribute('aPlane', new THREE.BufferAttribute(planePoints, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));

    // Shader Material
    this.material = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uCurrentModel: { value: this.currentModelIndex },
        uTargetModel: { value: this.targetModelIndex },
        uMorphFactor: { value: 1.0 },
        uExplode: { value: 0.0 },
        uAssemble: { value: 0.0 },
        uScale: { value: 1.0 },
        uModelRotX: { value: 0.0 },
        uModelRotY: { value: 0.0 },
        uAttractor: { value: new THREE.Vector3(0, 0, 0) },
        uAttractorStrength: { value: 0.0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColor1: { value: new THREE.Color('#ffffff') }, // Crisp holographic white / cyan core
        uColor2: { value: new THREE.Color('#00f0ff') },
        uColor3: { value: new THREE.Color('#9933ff') }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false
    });

    this.particles = new THREE.Points(geometry, this.material);
    this.scene.add(this.particles);
  }

  setModel(modelIndex) {
    const validIndex = ((modelIndex % MODELS.length) + MODELS.length) % MODELS.length;
    if (validIndex === this.targetModelIndex && this.morphProgress >= 1.0) return;

    this.currentModelIndex = this.targetModelIndex;
    this.targetModelIndex = validIndex;
    this.morphProgress = 0.0;

    if (this.material) {
      this.material.uniforms.uCurrentModel.value = this.currentModelIndex;
      this.material.uniforms.uTargetModel.value = this.targetModelIndex;
      this.material.uniforms.uMorphFactor.value = 0.0;
    }
  }

  nextModel() {
    this.setModel(this.targetModelIndex + 1);
  }

  prevModel() {
    this.setModel(this.targetModelIndex - 1);
  }

  getCurrentModel() {
    return MODELS[this.targetModelIndex];
  }

  setupResizeListener() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      const pixelRatio = Math.min(window.devicePixelRatio, 2);
      this.renderer.setPixelRatio(pixelRatio);
      if (this.material) {
        this.material.uniforms.uPixelRatio.value = pixelRatio;
      }
    });
  }

  update(gestureState, effectsManager) {
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    if (!this.material) return;

    const u = this.material.uniforms;
    u.uTime.value = elapsedTime;

    // Morph interpolation
    if (this.morphProgress < 1.0) {
      this.morphProgress = Math.min(1.0, this.morphProgress + delta * this.morphSpeed);
      u.uMorphFactor.value = this.morphProgress;
      if (this.morphProgress >= 1.0) {
        this.currentModelIndex = this.targetModelIndex;
        u.uCurrentModel.value = this.currentModelIndex;
      }
    }

    // Palette colors from effects manager
    effectsManager.update(delta);
    u.uColor1.value.copy(effectsManager.color1);
    u.uColor2.value.copy(effectsManager.color2);
    u.uColor3.value.copy(effectsManager.color3);

    // Gesture mappings
    if (gestureState) {
      u.uAttractor.value.set(
        gestureState.attractor.x,
        gestureState.attractor.y,
        gestureState.attractor.z
      );
      u.uAttractorStrength.value = gestureState.attractorStrength;

      // Open palm -> Exploded assembly view!
      u.uExplode.value = gestureState.expand;

      // Fist -> Assemble into compact dense core!
      u.uAssemble.value = gestureState.collapse;

      // Pinch -> Continuous Scale (0.4x to 2.4x)
      const scaleVal = (0.5 + gestureState.pinchDistance * 1.5) * gestureState.twoHandDistance;
      u.uScale.value = scaleVal;

      // Hand wave & tilt -> Rotate 3D Model
      if (gestureState.hasHands) {
        this.targetRotY = (gestureState.attractor.x / 4.0) * Math.PI;
        this.targetRotX = (gestureState.attractor.y / 4.0) * 0.8;
      }
    }

    // Smooth rotational lerp
    this.smoothRotX += (this.targetRotX - this.smoothRotX) * Math.min(1.0, delta * 4.0);
    this.smoothRotY += (this.targetRotY - this.smoothRotY) * Math.min(1.0, delta * 4.0);
    u.uModelRotX.value = this.smoothRotX;
    u.uModelRotY.value = this.smoothRotY;

    this.renderer.render(this.scene, this.camera);
  }

  getCanvas() {
    return this.renderer.domElement;
  }
}
