/**
 * WonderSnap - Automated System & Gesture Verification Test Suite
 */

import { clamp, lerp, dist2D, dist3D, SmoothValue, SmoothVector } from '../src/utils/math.js';
import { GestureEngine } from '../src/modules/gestures.js';
import { EffectsManager, EFFECT_MODES, COLOR_PALETTES } from '../src/modules/effects.js';
import { particleVertexShader, particleFragmentShader } from '../src/shaders/particleShaders.js';

console.log('🧪 Starting WonderSnap Automated Test Suite...\n');

let testsPassed = 0;
let testsTotal = 0;

function assert(condition, testName) {
  testsTotal++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

// -------------------------------------------------------------
// 1. Math & Smoothing Utilities
// -------------------------------------------------------------
console.log('1. Testing Math & EMA Smoothing:');
assert(clamp(1.5, 0, 1) === 1, 'clamp upper bound');
assert(clamp(-0.2, 0, 1) === 0, 'clamp lower bound');
assert(lerp(10, 20, 0.5) === 15, 'lerp midpoint');
assert(dist2D({ x: 0, y: 0 }, { x: 3, y: 4 }) === 5, 'dist2D 3-4-5 triangle');
assert(dist3D({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 }) === 10, 'dist3D Z distance');

const smValue = new SmoothValue(0, 0.5);
smValue.setTarget(10);
smValue.update();
assert(smValue.value === 5, 'SmoothValue EMA update');

const smVec = new SmoothVector(0, 0, 0, 0.5);
smVec.setTarget(10, 20, 30);
smVec.update();
assert(smVec.x === 5 && smVec.y === 10 && smVec.z === 15, 'SmoothVector EMA update');

// -------------------------------------------------------------
// 2. Effects & Color Palettes
// -------------------------------------------------------------
console.log('\n2. Testing Effects & Palette Management:');
const fx = new EffectsManager();
assert(fx.getCurrentMode().key === 'galaxy', 'Initial mode is Galaxy');
assert(fx.getCurrentPalette().name === 'Cyber Neon', 'Initial palette is Cyber Neon');

fx.nextMode();
assert(fx.getCurrentMode().key === 'fire', 'nextMode switches to Fire');

fx.nextMode();
assert(fx.getCurrentMode().key === 'morph', 'nextMode switches to Morph');

fx.nextMode();
assert(fx.getCurrentMode().key === 'galaxy', 'nextMode wraps back to Galaxy');

fx.nextPalette();
assert(fx.getCurrentPalette().name === 'Solar Flare', 'nextPalette switches to Solar Flare');

// -------------------------------------------------------------
// 3. Shaders Validation (3D Models & Gesture Uniforms)
// -------------------------------------------------------------
console.log('\n3. Testing GLSL Shaders:');
assert(particleVertexShader.includes('attribute vec3 aBike;'), 'Vertex shader contains Royal Enfield aBike attribute');
assert(particleVertexShader.includes('attribute vec3 aCar;'), 'Vertex shader contains BMW aCar attribute');
assert(particleVertexShader.includes('attribute vec3 aHuman;'), 'Vertex shader contains Human aHuman attribute');
assert(particleVertexShader.includes('attribute vec3 aPlane;'), 'Vertex shader contains Aeroplane aPlane attribute');
assert(particleVertexShader.includes('uniform float uExplode;'), 'Vertex shader contains uExplode uniform');
assert(particleVertexShader.includes('uniform float uAssemble;'), 'Vertex shader contains uAssemble uniform');
assert(particleVertexShader.includes('uniform float uScale;'), 'Vertex shader contains uScale uniform');
assert(particleVertexShader.includes('uniform float uModelRotY;'), 'Vertex shader contains uModelRotY hand tilt uniform');
assert(particleFragmentShader.includes('gl_PointCoord'), 'Fragment shader defines gl_PointCoord circle profile');

// -------------------------------------------------------------
// 4. Gesture Engine Recognition Tests
// -------------------------------------------------------------
console.log('\n4. Testing Gesture Classification Logic:');
const gestures = new GestureEngine();

// Mock landmarks generator
function makeHand(overrides = {}) {
  // Base relaxed hand with 21 landmarks
  const landmarks = Array.from({ length: 21 }, (_, i) => ({
    x: 0.5,
    y: 0.5 + i * 0.01,
    z: 0.0
  }));

  // Landmark 0: Wrist
  landmarks[0] = { x: 0.5, y: 0.8, z: 0.0 };
  // Landmark 9: Middle MCP
  landmarks[9] = { x: 0.5, y: 0.5, z: 0.0 };

  // Set fingers default extended
  // Thumb: 1, 2, 3, 4
  landmarks[1] = { x: 0.45, y: 0.75, z: 0 };
  landmarks[2] = { x: 0.42, y: 0.7, z: 0 };
  landmarks[3] = { x: 0.4, y: 0.65, z: 0 };
  landmarks[4] = { x: 0.38, y: 0.6, z: 0 };

  // Index: 5, 6, 7, 8
  landmarks[5] = { x: 0.45, y: 0.55, z: 0 };
  landmarks[6] = { x: 0.45, y: 0.45, z: 0 };
  landmarks[7] = { x: 0.45, y: 0.38, z: 0 };
  landmarks[8] = { x: 0.45, y: 0.3, z: 0 };

  // Middle: 9, 10, 11, 12
  landmarks[10] = { x: 0.5, y: 0.42, z: 0 };
  landmarks[11] = { x: 0.5, y: 0.35, z: 0 };
  landmarks[12] = { x: 0.5, y: 0.28, z: 0 };

  // Ring: 13, 14, 15, 16
  landmarks[13] = { x: 0.55, y: 0.55, z: 0 };
  landmarks[14] = { x: 0.55, y: 0.45, z: 0 };
  landmarks[15] = { x: 0.55, y: 0.38, z: 0 };
  landmarks[16] = { x: 0.55, y: 0.32, z: 0 };

  // Pinky: 17, 18, 19, 20
  landmarks[17] = { x: 0.6, y: 0.58, z: 0 };
  landmarks[18] = { x: 0.6, y: 0.5, z: 0 };
  landmarks[19] = { x: 0.6, y: 0.44, z: 0 };
  landmarks[20] = { x: 0.6, y: 0.38, z: 0 };

  // Apply overrides
  Object.assign(landmarks, overrides);
  return landmarks;
}

// Test Open Palm
const openHand = makeHand();
const stateOpen = gestures.update({ landmarks: [openHand] });
assert(stateOpen.hasHands === true, 'Hand detected in frame');
assert(stateOpen.activeGesture === 'Open Palm', `Open Palm recognized (got: ${stateOpen.activeGesture})`);

// Test Fist
// Curl all tips close to wrist (y > 0.6)
const fistHand = makeHand({
  4: { x: 0.48, y: 0.65, z: 0 },
  8: { x: 0.46, y: 0.68, z: 0 },
  12: { x: 0.5, y: 0.68, z: 0 },
  16: { x: 0.54, y: 0.68, z: 0 },
  20: { x: 0.58, y: 0.68, z: 0 }
});
const stateFist = gestures.update({ landmarks: [fistHand] });
assert(stateFist.activeGesture === 'Fist', `Fist recognized (got: ${stateFist.activeGesture})`);

// Test Pinch (Thumb tip 4 meets Index tip 8)
const pinchHand = makeHand({
  4: { x: 0.45, y: 0.35, z: 0 },
  8: { x: 0.45, y: 0.35, z: 0 }
});
const statePinch = gestures.update({ landmarks: [pinchHand] });
assert(statePinch.isPinching === true, 'Pinch detected when tip 4 and tip 8 coincide');

// Test Peace Sign (Index 8 & Middle 12 extended; Ring 16 & Pinky 20 curled)
let peaceTriggered = false;
gestures.onPeaceSign = () => { peaceTriggered = true; };
const peaceHand = makeHand({
  16: { x: 0.55, y: 0.68, z: 0 },
  20: { x: 0.6, y: 0.68, z: 0 }
});
const statePeace = gestures.update({ landmarks: [peaceHand] });
assert(statePeace.activeGesture === 'Peace Sign', `Peace Sign recognized (got: ${statePeace.activeGesture})`);
assert(peaceTriggered === true, 'Peace Sign callback fired');

// Test Thumbs Up
let thumbsUpTriggered = false;
gestures.onThumbsUp = () => { thumbsUpTriggered = true; };
const thumbsUpHand = makeHand({
  // Thumb extended vertically high (y = 0.15)
  1: { x: 0.5, y: 0.6, z: 0 },
  2: { x: 0.5, y: 0.45, z: 0 },
  3: { x: 0.5, y: 0.3, z: 0 },
  4: { x: 0.5, y: 0.15, z: 0 },
  // All other fingers curled into palm
  8: { x: 0.46, y: 0.65, z: 0 },
  12: { x: 0.5, y: 0.65, z: 0 },
  16: { x: 0.54, y: 0.65, z: 0 },
  20: { x: 0.58, y: 0.65, z: 0 }
});
const stateThumbs = gestures.update({ landmarks: [thumbsUpHand] });
assert(stateThumbs.activeGesture === 'Thumbs Up', `Thumbs Up recognized (got: ${stateThumbs.activeGesture})`);
assert(thumbsUpTriggered === true, 'Thumbs Up callback fired');

// Test Two-Hand Distance
const handA = makeHand();
const handB = makeHand();
// Offset hand B to the right
handB.forEach(pt => pt.x += 0.4);
const stateTwoHands = gestures.update({ landmarks: [handA, handB] });
assert(stateTwoHands.handCount === 2, '2 hands recognized in frame');
assert(stateTwoHands.twoHandDistance > 0.8, 'Two-hand distance stretch computed');

console.log(`\n========================================`);
console.log(`Tests Completed: ${testsPassed} / ${testsTotal} Passed.`);
console.log(`========================================\n`);

if (testsPassed === testsTotal) {
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
} else {
  process.exit(1);
}
