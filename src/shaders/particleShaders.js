/**
 * WonderSnap - Custom GLSL Shaders for 3D Particle Models
 * Supports Royal Enfield Bike, BMW Car, Human Skeleton, and Aeroplane with
 * smooth morphing, 3D hand rotation, exploded view, and glowing particle halo.
 */

export const particleVertexShader = /* glsl */ `
  precision highp float;

  attribute vec3 aBike;   // Royal Enfield Bike 3D coordinates
  attribute vec3 aCar;    // BMW Sports Car 3D coordinates
  attribute vec3 aHuman;  // Human Anatomical Skeleton 3D coordinates
  attribute vec3 aPlane;  // Jet Aeroplane 3D coordinates
  attribute vec3 aSeed;   // Unique seed per particle (noise, phase, size)

  uniform float uTime;
  uniform float uCurrentModel;   // 0: Bike, 1: Car, 2: Human, 3: Plane
  uniform float uTargetModel;
  uniform float uMorphFactor;    // 0.0 to 1.0 smooth morph interpolation
  uniform float uExplode;        // Open palm exploded assembly view
  uniform float uAssemble;       // Fist collapse/assemble into core
  uniform float uScale;          // Pinch zoom / scale
  uniform float uModelRotX;      // Hand tilt rotation X
  uniform float uModelRotY;      // Hand wave rotation Y
  uniform vec3 uAttractor;       // Hand 3D position
  uniform float uAttractorStrength;
  uniform float uPixelRatio;

  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;

  // Rotation matrix around Y axis
  mat3 rotateY(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(
      c, 0.0, s,
      0.0, 1.0, 0.0,
      -s, 0.0, c
    );
  }

  // Rotation matrix around X axis
  mat3 rotateX(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(
      1.0, 0.0, 0.0,
      0.0, c, -s,
      0.0, s, c
    );
  }

  vec3 getModelPos(float modelIdx) {
    if (modelIdx < 0.5) return aBike;
    if (modelIdx < 1.5) return aCar;
    if (modelIdx < 2.5) return aHuman;
    return aPlane;
  }

  void main() {
    vec3 pA = getModelPos(uCurrentModel);
    vec3 pB = getModelPos(uTargetModel);

    // Smooth cosmic flow interpolation between 3D models
    float t = smoothstep(0.0, 1.0, uMorphFactor);
    vec3 p = mix(pA, pB, t);

    // Subtle idle aerodynamic float
    float idleWobble = sin(uTime * 1.5 + p.y * 3.0 + aSeed.x * 6.28) * 0.025;
    p.y += idleWobble;

    // -------------------------------------------------------------
    // EXPLODED VIEW (Open Palm Gesture: explode parts outward to see inside)
    // -------------------------------------------------------------
    if (uExplode > 0.01) {
      vec3 radialDir = normalize(p + vec3(0.001));
      float blast = uExplode * (1.6 + aSeed.x * 1.8);
      p += radialDir * blast;
    }

    // -------------------------------------------------------------
    // ASSEMBLE / SINGULARITY (Fist Gesture: collapse parts together)
    // -------------------------------------------------------------
    if (uAssemble > 0.01) {
      vec3 core = (uAttractorStrength > 0.2) ? uAttractor * 0.4 : vec3(0.0);
      vec3 toCore = p - core;
      vec3 compressed = normalize(toCore + 0.001) * (0.35 + aSeed.z * 0.15);
      
      // Fast spin in orb mode
      float spin = uTime * 5.0 + aSeed.y * 6.28;
      compressed.xz = vec2(
        cos(spin) * compressed.x - sin(spin) * compressed.z,
        sin(spin) * compressed.x + cos(spin) * compressed.z
      );
      
      p = mix(p, core + compressed, uAssemble * 0.9);
    }

    // -------------------------------------------------------------
    // 3D MODEL ROTATION (Controlled by Hand Wave / Tilt or Auto-rotation)
    // -------------------------------------------------------------
    float autoSpin = uTime * 0.25;
    p = rotateY(uModelRotY + autoSpin) * p;
    p = rotateX(uModelRotX) * p;

    // -------------------------------------------------------------
    // SCALE & ZOOM (Pinch Distance)
    // -------------------------------------------------------------
    p *= uScale;

    // -------------------------------------------------------------
    // HAND ATTRACTOR VORTEX
    // -------------------------------------------------------------
    if (uAttractorStrength > 0.05 && uAssemble < 0.85) {
      vec3 diff = uAttractor - p;
      float d = length(diff);
      float pull = (uAttractorStrength / (d * d * 0.35 + 0.8)) * 0.6;
      pull = min(pull, 1.8);
      
      vec3 pullDir = normalize(diff + 0.001);
      vec3 swirl = cross(pullDir, vec3(0.0, 0.0, 1.0)) * 0.4;
      p += (pullDir * pull * 0.7 + swirl * pull * 0.35);
    }

    // -------------------------------------------------------------
    // POSITIONING & FRAMING (Centered on viewer's body — matches reference image)
    // -------------------------------------------------------------
    // No X offset — model sits directly in the center of the viewport
    // over the user's real webcam body silhouette

    // -------------------------------------------------------------
    // DYNAMIC COLOR BLENDING (Crisp Holographic White & Cyan Glow)
    // -------------------------------------------------------------
    float heightNorm = clamp((p.y + 1.8) / 3.6, 0.0, 1.0);
    vec3 col = mix(uColor1, uColor2, heightNorm);
    col = mix(col, uColor3, smoothstep(0.3, 0.9, heightNorm + aSeed.z * 0.2));

    // Holographic core brightness
    col += vec3(0.35) * (sin(uTime * 4.0 + aSeed.x * 12.0) * 0.15 + 0.35);

    vColor = col;
    vAlpha = clamp(0.75 + aSeed.y * 0.25 + uAssemble * 0.25, 0.35, 1.0);

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vDepth = -mvPosition.z;

    // Perspective point size
    float pointSize = (32.0 * uPixelRatio / -mvPosition.z) * (1.0 + uAssemble * 0.35);
    gl_PointSize = clamp(pointSize, 3.0, 48.0);
  }
`;

export const particleFragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;
  uniform float uTime;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5) {
      discard;
    }

    // Glowing particle halo with bright core
    float core = exp(-dist * 8.5);
    float halo = smoothstep(0.5, 0.0, dist);
    float brightness = core * 1.5 + halo * 0.55;

    // Shimmer pulse
    float shimmer = 0.92 + 0.08 * sin(uTime * 6.0 + vDepth * 4.0);

    vec3 finalColor = vColor * brightness * shimmer;
    float finalAlpha = vAlpha * halo;

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;
