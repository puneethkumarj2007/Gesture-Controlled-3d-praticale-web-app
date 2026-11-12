/**
 * WonderSnap — 3D Particle Model Generators (v3 — Exact Reference-Image Matched)
 *
 * Faithfully reproduces the 4 blueprint diagrams from the user's reference images:
 *  0. Royal Enfield Classic 350 ("AI VEHICLE PART SEGMENTATION - ROYAL ENFIELD")
 *  1. BMW M4 Competition Coupe ("AI VEHICLE PART SEGMENTATION - BMW M4 COMPETITION")
 *  2. Human Body Anatomy & Musculoskeletal ("AI HUMAN BODY PART SEGMENTATION & ANATOMICAL MAPPING")
 *  3. Commercial Airliner with Cabin Cutaway ("AI AIRCRAFT PART SEGMENTATION & AERODYNAMIC MAPPING")
 *
 * Coordinate Convention:
 *  X → Front/Back or Length
 *  Y → Height (Up)
 *  Z → Width (Left/Right)
 */

export const MODEL_COUNT = 16384;

/* Noise helper */
const n = (s = 0.03) => (Math.random() - 0.5) * s;
const rand = Math.random;

/* ─────────────────────────────────────────────────────────────────────────── */
/*  0. Royal Enfield Classic — "AI VEHICLE PART SEGMENTATION & MECHANICAL MAPPING" */
/* ─────────────────────────────────────────────────────────────────────────── */
export function generateBikePoints(count = MODEL_COUNT) {
  const pos = new Float32Array(count * 3);
  let idx = 0;

  const add = (x, y, z) => {
    if (idx >= count * 3) return;
    pos[idx++] = x; pos[idx++] = y; pos[idx++] = z;
  };

  // Center bike coordinates: Front is +X, Rear is -X, Up is +Y, Width is Z
  // Bike length ~3.4 units, height ~2.0 units

  // ── 1. Front Wheel & Spokes (19" classic spoked rim, Center: [1.40, -0.60, 0]) ──
  const FW_COUNT = Math.floor(count * 0.13);
  for (let i = 0; i < FW_COUNT; i++) {
    const a = rand() * Math.PI * 2;
    const isTyre = rand() < 0.60;
    const r = isTyre ? 0.65 + rand() * 0.08 : 0.62;
    const w = (rand() - 0.5) * (isTyre ? 0.18 : 0.08);
    add(1.40 + Math.cos(a) * r, -0.60 + Math.sin(a) * r, w);
  }
  // 36 wire spokes radiating from front hub
  const FS_COUNT = Math.floor(count * 0.035);
  for (let i = 0; i < FS_COUNT; i++) {
    const spokeIdx = i % 36;
    const a = (spokeIdx / 36) * Math.PI * 2 + (rand() - 0.5) * 0.04;
    const r = rand() * 0.60;
    const side = (spokeIdx % 2 === 0) ? 0.06 : -0.06;
    add(1.40 + Math.cos(a) * r, -0.60 + Math.sin(a) * r, side * (1 - r / 0.60));
  }
  // Front disc brake rotor
  for (let i = 0; i < Math.floor(count * 0.015); i++) {
    const a = rand() * Math.PI * 2;
    const r = rand() * 0.32;
    add(1.40 + Math.cos(a) * r, -0.60 + Math.sin(a) * r, 0.08 + n(0.01));
  }

  // ── 2. Rear Wheel & Spokes (18" classic spoked rim, Center: [-1.30, -0.60, 0]) ──
  const RW_COUNT = Math.floor(count * 0.12);
  for (let i = 0; i < RW_COUNT; i++) {
    const a = rand() * Math.PI * 2;
    const isTyre = rand() < 0.60;
    const r = isTyre ? 0.62 + rand() * 0.09 : 0.59;
    const w = (rand() - 0.5) * (isTyre ? 0.22 : 0.09);
    add(-1.30 + Math.cos(a) * r, -0.60 + Math.sin(a) * r, w);
  }
  const RS_COUNT = Math.floor(count * 0.03);
  for (let i = 0; i < RS_COUNT; i++) {
    const spokeIdx = i % 36;
    const a = (spokeIdx / 36) * Math.PI * 2 + (rand() - 0.5) * 0.04;
    const r = rand() * 0.58;
    const side = (spokeIdx % 2 === 0) ? 0.07 : -0.07;
    add(-1.30 + Math.cos(a) * r, -0.60 + Math.sin(a) * r, side * (1 - r / 0.58));
  }

  // ── 3. Telescopic Front Fork (Suspension) with classic sleeves & triple clamps ──
  const FK_COUNT = Math.floor(count * 0.06);
  for (let i = 0; i < FK_COUNT; i++) {
    const t = rand();
    const side = rand() > 0.5 ? 0.15 : -0.15;
    // Rake angle ~26 degrees from vertical
    const fx = 1.40 - t * 0.42;
    const fy = -0.60 + t * 1.35;
    add(fx + n(0.015), fy, side + n(0.015));
  }

  // ── 4. Headlight Assembly (Round classic nacelle with visor & turn indicators) ──
  const HL_COUNT = Math.floor(count * 0.045);
  for (let i = 0; i < HL_COUNT; i++) {
    const u = rand() * Math.PI * 2;
    const r = rand() * 0.22;
    // Visor cap over top of lamp
    const isVisor = (Math.sin(u) > 0.4 && rand() < 0.4);
    const vx = isVisor ? 1.58 : 1.52;
    add(vx + n(0.02), 0.75 + Math.sin(u) * r, Math.cos(u) * r);
  }
  // Amber front turn signals
  for (let i = 0; i < Math.floor(count * 0.015); i++) {
    const side = rand() > 0.5 ? 0.38 : -0.38;
    const a = rand() * Math.PI * 2;
    const r = rand() * 0.07;
    add(1.36 + Math.cos(a) * r, 0.65 + Math.sin(a) * r, side + n(0.01));
  }

  // ── 5. Teardrop Fuel Tank with Rubber Knee Grips ("ROYAL ENFIELD") ──
  const TK_COUNT = Math.floor(count * 0.11);
  for (let i = 0; i < TK_COUNT; i++) {
    const t = rand(); // 0 = front, 1 = rear
    const x = 0.88 - t * 1.05; // 0.88 to -0.17
    // Classic teardrop shape (tapers towards seat)
    const bulb = Math.sin(t * Math.PI * 0.85);
    const ry = 0.22 * bulb;
    const rz = 0.32 * bulb;
    const a = rand() * Math.PI * 2;
    // Indent knee grips on side
    let z = Math.cos(a) * rz;
    if (t > 0.45 && Math.abs(z) > 0.16) {
      z *= 0.85; // rubber pad indent
    }
    add(x + n(), 0.38 + Math.sin(a) * ry + (1 - t) * 0.08, z);
  }

  // ── 6. Classic Solo Rider Seat with Springs & Curved Rear Fender ──
  const ST_COUNT = Math.floor(count * 0.07);
  for (let i = 0; i < ST_COUNT; i++) {
    const t = rand();
    const x = -0.20 - t * 0.65; // -0.20 to -0.85
    const width = 0.36 * Math.sin(t * Math.PI * 0.9 + 0.1);
    const z = (rand() - 0.5) * width;
    // Contour: scooped in middle, rises slightly at rear
    const yCurve = Math.pow(t - 0.45, 2) * 0.18;
    add(x + n(0.02), 0.25 + yCurve, z);
  }
  // Chrome coil springs under seat
  for (let i = 0; i < Math.floor(count * 0.015); i++) {
    const side = rand() > 0.5 ? 0.14 : -0.14;
    const theta = rand() * Math.PI * 8;
    const sy = 0.05 + (theta / (Math.PI * 8)) * 0.18;
    add(-0.72 + Math.cos(theta) * 0.04, sy, side + Math.sin(theta) * 0.04);
  }

  // ── 7. Single-Cylinder Engine Block with Cooling Fins & Polished Crankcase ──
  const EN_COUNT = Math.floor(count * 0.12);
  for (let i = 0; i < EN_COUNT; i++) {
    const part = rand();
    if (part < 0.45) {
      // Upright cylinder barrel with horizontal cooling fins
      const t = rand();
      const cy = -0.15 + t * 0.45;
      const finRadius = 0.22 * (1.0 + Math.sin(t * 28.0) * 0.18); // ribbed fins
      const a = rand() * Math.PI * 2;
      add(0.25 + Math.cos(a) * finRadius * 0.75, cy, Math.sin(a) * finRadius);
    } else if (part < 0.80) {
      // Rounded lower crankcase / engine sump
      const a = rand() * Math.PI * 2;
      const r = rand() * 0.28;
      add(0.18 + Math.cos(a) * r * 1.2, -0.42 + Math.sin(a) * r * 0.75, (rand() - 0.5) * 0.38);
    } else {
      // Cylinder head & pushrod rocker box
      const a = rand() * Math.PI * 2;
      add(0.24 + (rand() - 0.5) * 0.24, 0.34 + (rand() - 0.5) * 0.10, Math.sin(a) * 0.20);
    }
  }

  // ── 8. Gearbox & Side Tool / Air Filter Box (Oval side toolbox) ──
  const GB_COUNT = Math.floor(count * 0.05);
  for (let i = 0; i < GB_COUNT; i++) {
    // Left side toolbox / Right side air filter oval canister
    const side = rand() > 0.5 ? 0.22 : -0.22;
    const a = rand() * Math.PI * 2;
    const rx = 0.16; const ry = 0.12;
    add(-0.25 + Math.cos(a) * rx, -0.05 + Math.sin(a) * ry, side + n(0.02));
  }

  // ── 9. Long Chrome Exhaust Pipe with Torpedo Silencer (Right side) ──
  const EX_COUNT = Math.floor(count * 0.07);
  for (let i = 0; i < EX_COUNT; i++) {
    const t = i / EX_COUNT; // 0=engine exhaust port, 1=tailpipe tip
    let ex, ey;
    if (t < 0.30) {
      // Sweeps forward & down from cylinder head
      const f = t / 0.30;
      ex = 0.42 - f * 0.18;
      ey = 0.18 - f * 0.60;
    } else {
      // Straight chrome pipe runs back into tapered torpedo silencer
      const f = (t - 0.30) / 0.70;
      ex = 0.24 - f * 1.70; // extends to -1.46
      ey = -0.42 + f * 0.08;
    }
    const rSilencer = (t > 0.55 && t < 0.92) ? 0.065 : 0.035;
    const a = rand() * Math.PI * 2;
    add(ex, ey + Math.sin(a) * rSilencer, 0.25 + Math.cos(a) * rSilencer);
  }

  // ── 10. Double Cradle Chassis Frame & Rear Shock Absorbers ──
  const FR_COUNT = Math.floor(count * 0.065);
  for (let i = 0; i < FR_COUNT; i++) {
    const part = Math.floor(rand() * 4);
    const t = rand();
    if (part === 0) {
      // Backbone tube under tank
      add(0.90 - t * 1.10, 0.42 - t * 0.15, n(0.04));
    } else if (part === 1) {
      // Down tubes wrapping under engine (double cradle)
      const side = rand() > 0.5 ? 0.12 : -0.12;
      add(0.85 - t * 0.70, 0.40 - t * 0.95, side);
    } else if (part === 2) {
      // Rear swingarm to rear wheel hub
      const side = rand() > 0.5 ? 0.16 : -0.16;
      add(-0.25 - t * 1.05, -0.38 - t * 0.22, side);
    } else {
      // Rear dual shock absorbers
      const side = rand() > 0.5 ? 0.22 : -0.22;
      add(-0.75 - t * 0.50, 0.12 - t * 0.70, side + n(0.02));
    }
  }

  // ── 11. Handlebars & Controls ──
  const HB_COUNT = Math.floor(count * 0.03);
  for (let i = 0; i < HB_COUNT; i++) {
    const t = (i / HB_COUNT) * 2 - 1; // -1 to +1
    const z = t * 0.65;
    const sweep = Math.abs(t) * 0.14;
    add(1.05 - sweep, 0.95 + Math.abs(t) * 0.06, z);
  }

  // Fill remaining particles into motorcycle body and fenders
  while (idx < count * 3) {
    const t = rand();
    const x = -1.50 + rand() * 3.00;
    add(x, -0.65 + rand() * 1.60, (rand() - 0.5) * 0.50);
  }

  return pos;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  1. BMW M4 Competition — "AI VEHICLE PART SEGMENTATION - BMW M4 COMPETITION" */
/* ─────────────────────────────────────────────────────────────────────────── */
export function generateCarPoints(count = MODEL_COUNT) {
  const pos = new Float32Array(count * 3);
  let idx = 0;

  const add = (x, y, z) => {
    if (idx >= count * 3) return;
    pos[idx++] = x; pos[idx++] = y; pos[idx++] = z;
  };

  // Dimensions: Front is +X (+2.40), Rear is -X (-2.40), Width Z (+/-1.0), Height Y (-0.60 to +0.80)

  // ── 1. Iconic Vertical Frameless Kidney Grilles (M4 Signature, Front X: 2.38) ──
  const KG_COUNT = Math.floor(count * 0.06);
  for (let i = 0; i < KG_COUNT; i++) {
    const isLeft = rand() > 0.5;
    const sign = isLeft ? 1 : -1;
    const t = rand(); // height along grille
    const y = -0.42 + t * 0.48; // -0.42 to 0.06 (tall vertical grilles)
    // Grille outline + horizontal twin slats
    const slatChoice = Math.floor(rand() * 8);
    const zCenter = sign * 0.22;
    const width = 0.18 * (0.85 + Math.sin(t * Math.PI) * 0.35);
    const z = zCenter + (rand() - 0.5) * width;
    add(2.38 + n(0.02), y, z);
  }

  // ── 2. BMW Laserlight Headlights (Hexagonal twin LED DRLs with blue accents) ──
  const HL_COUNT = Math.floor(count * 0.045);
  for (let i = 0; i < HL_COUNT; i++) {
    const side = rand() > 0.5 ? 1 : -1;
    const ringChoice = rand() > 0.5 ? 0 : 1;
    const ringZ = side * (0.55 + ringChoice * 0.28);
    // Angular hexagonal halo ring
    const a = rand() * Math.PI * 2;
    const hr = 0.095;
    add(2.28 + Math.cos(a) * 0.03, 0.04 + Math.sin(a) * hr, ringZ + Math.cos(a) * hr * 0.85);
  }

  // ── 3. Aggressive Front Splitter & Bumper Air Curtains (Low X: 2.45, Y: -0.58) ──
  const SP_COUNT = Math.floor(count * 0.04);
  for (let i = 0; i < SP_COUNT; i++) {
    const z = (rand() - 0.5) * 1.90;
    // Winglets on outer edges of splitter
    const isWinglet = Math.abs(z) > 0.85;
    const sy = isWinglet ? -0.52 + rand() * 0.12 : -0.58 + n(0.015);
    add(2.44 + (rand() - 0.5) * 0.10, sy, z);
  }

  // ── 4. S58 3.0L Twin-Turbo Inline-6 Engine Bay Cutaway (Under Hood: X: 0.70 to 1.90) ──
  const EN_COUNT = Math.floor(count * 0.13);
  for (let i = 0; i < EN_COUNT; i++) {
    const part = rand();
    if (part < 0.40) {
      // Long Inline-6 Engine Block & Carbon Engine Cover
      const ex = 0.75 + rand() * 1.05;
      const ey = -0.15 + (rand() - 0.5) * 0.25;
      const ez = (rand() - 0.5) * 0.36;
      add(ex, ey, ez);
    } else if (part < 0.65) {
      // Carbon fiber V-shaped strut brace across engine bay
      const t = rand();
      const side = rand() > 0.5 ? 1 : -1;
      const bx = 1.00 + t * 0.75;
      const by = 0.15 - t * 0.05;
      const bz = side * (0.78 - t * 0.68);
      add(bx + n(0.015), by, bz);
    } else if (part < 0.85) {
      // Twin Turbochargers & Charge Pipes (Right side of engine)
      const a = rand() * Math.PI * 2;
      const r = rand() * 0.12;
      const turboChoice = rand() > 0.5 ? 1.05 : 1.45;
      add(turboChoice + Math.cos(a) * r, -0.18 + Math.sin(a) * r, 0.32 + n(0.02));
    } else {
      // Intake plenum & radiator heat exchangers
      add(2.05 + n(0.04), -0.25 + rand() * 0.35, (rand() - 0.5) * 0.70);
    }
  }

  // ── 5. 8-Speed M Steptronic Transmission & Active M Differential Cutaway ──
  const DT_COUNT = Math.floor(count * 0.04);
  for (let i = 0; i < DT_COUNT; i++) {
    const isTrans = rand() < 0.65;
    if (isTrans) {
      // Transmission casing in center tunnel
      const tx = 0.10 + rand() * 0.60;
      add(tx, -0.35 + (rand() - 0.5) * 0.16, (rand() - 0.5) * 0.22);
    } else {
      // Active M Differential at rear axle
      const a = rand() * Math.PI * 2;
      const r = rand() * 0.15;
      add(-1.42 + Math.cos(a) * r, -0.38 + Math.sin(a) * r, (rand() - 0.5) * 0.28);
    }
  }

  // ── 6. Cockpit Cutaway with Dual M Carbon Bucket Seats ──
  const SEAT_COUNT = Math.floor(count * 0.07);
  for (let i = 0; i < SEAT_COUNT; i++) {
    const side = rand() > 0.5 ? 0.38 : -0.38;
    const t = rand();
    if (t < 0.55) {
      // High-back bucket seat backrest with harness pass-through holes
      const sy = -0.22 + t * 0.95;
      const sx = 0.05 - t * 0.22;
      const sz = side + (rand() - 0.5) * 0.32;
      add(sx + n(0.02), sy, sz);
    } else {
      // Ergonomic seat base cushion
      const sx = -0.10 + rand() * 0.42;
      const sz = side + (rand() - 0.5) * 0.36;
      add(sx, -0.28 + n(0.02), sz);
    }
  }

  // ── 7. Carbon Fibre Roof with Aerodynamic Central Channel ──
  const RF_COUNT = Math.floor(count * 0.08);
  for (let i = 0; i < RF_COUNT; i++) {
    const x = 0.55 - rand() * 1.85; // 0.55 to -1.30
    const halfW = 0.88 * (1.0 - Math.pow(x / 2.0, 2) * 0.2);
    const z = (rand() - 0.5) * 2 * halfW;
    // Central depression channel along carbon roof
    const centerDip = Math.exp(-Math.pow(z / 0.18, 2)) * 0.04;
    const yRoof = 0.78 - Math.pow((x + 0.35) / 1.6, 2) * 0.12 - centerDip;
    add(x + n(0.015), yRoof, z);
  }

  // ── 8. 19"/20" Forged M Light-Alloy Wheels (Star-Spoke Rims & M Compound Brakes) ──
  const wheels = [
    { x: 1.52, y: -0.42, z: 0.96 }, // Front Left (19")
    { x: 1.52, y: -0.42, z: -0.96 }, // Front Right
    { x: -1.42, y: -0.40, z: 0.98 }, // Rear Left (20")
    { x: -1.42, y: -0.40, z: -0.98 }, // Rear Right
  ];
  const WH_COUNT = Math.floor(count * 0.18);
  for (let i = 0; i < WH_COUNT; i++) {
    const wl = wheels[i % 4];
    const isFront = (i % 4 < 2);
    const maxR = isFront ? 0.44 : 0.47;
    const a = rand() * Math.PI * 2;
    const part = rand();
    if (part < 0.45) {
      // Low-profile Michelin Pilot Sport tyre
      const r = maxR - 0.06 + rand() * 0.08;
      const w = (rand() - 0.5) * (isFront ? 0.22 : 0.26);
      add(wl.x + Math.cos(a) * r, wl.y + Math.sin(a) * r, wl.z + w);
    } else if (part < 0.75) {
      // Double-spoke star forged M rim
      const spokeIdx = Math.floor(rand() * 5); // 5 twin spokes
      const spokeAngle = (spokeIdx / 5) * Math.PI * 2 + (rand() > 0.5 ? 0.06 : -0.06);
      const r = rand() * (maxR - 0.06);
      add(wl.x + Math.cos(spokeAngle) * r, wl.y + Math.sin(spokeAngle) * r, wl.z + (rand() - 0.5) * 0.08);
    } else {
      // Perforated cross-drilled carbon brake rotor & M caliper
      const r = rand() * 0.32;
      const isCaliper = (Math.cos(a) > 0.65 && Math.sin(a) > 0.2);
      const cz = isCaliper ? wl.z * 0.90 : wl.z * 0.82;
      add(wl.x + Math.cos(a) * r, wl.y + Math.sin(a) * r, cz);
    }
  }

  // ── 9. Carbon Fibre Rear Diffuser & Quad M Exhausts (Rear X: -2.35) ──
  const DF_COUNT = Math.floor(count * 0.06);
  for (let i = 0; i < DF_COUNT; i++) {
    const z = (rand() - 0.5) * 1.50;
    const dy = -0.56 + (rand() - 0.5) * 0.14;
    add(-2.36 + n(0.03), dy, z);
  }
  // Quad 100mm black chrome exhaust tailpipes
  const exhaustPositions = [
    { x: -2.42, y: -0.48, z: 0.45 },
    { x: -2.42, y: -0.48, z: 0.58 },
    { x: -2.42, y: -0.48, z: -0.45 },
    { x: -2.42, y: -0.48, z: -0.58 },
  ];
  for (let i = 0; i < Math.floor(count * 0.025); i++) {
    const ep = exhaustPositions[i % 4];
    const a = rand() * Math.PI * 2;
    const r = rand() * 0.055;
    add(ep.x + n(0.02), ep.y + Math.sin(a) * r, ep.z + Math.cos(a) * r);
  }

  // ── 10. Exterior Body Panels & Flared Wheel Arches ──
  const BD_COUNT = Math.floor(count * 0.16);
  for (let i = 0; i < BD_COUNT; i++) {
    const x = 2.30 - rand() * 4.60; // 2.30 to -2.30
    const side = rand() > 0.5 ? 1 : -1;
    // Aerodynamic waistline curvature with wide rear fenders
    const flare = Math.exp(-Math.pow((x + 1.4) / 0.7, 2)) * 0.14;
    const z = side * (0.90 + flare + n(0.02));
    const y = -0.50 + rand() * 0.70;
    
    // Skip wheel wells
    const dF = Math.hypot(x - 1.52, y + 0.42);
    const dR = Math.hypot(x + 1.42, y + 0.40);
    if (dF > 0.48 && dR > 0.50) {
      add(x, y, z);
    }
  }

  // Fill remaining particles into chassis floor
  while (idx < count * 3) {
    const x = 2.20 - rand() * 4.40;
    const z = (rand() - 0.5) * 1.70;
    add(x, -0.60 + n(0.02), z);
  }

  return pos;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  2. Full-Body Human — "AI HUMAN BODY PART SEGMENTATION & ANATOMICAL MAPPING" */
/* ─────────────────────────────────────────────────────────────────────────── */
export function generateHumanPoints(count = MODEL_COUNT) {
  const pos = new Float32Array(count * 3);
  let idx = 0;

  const add = (x, y, z) => {
    if (idx >= count * 3) return;
    pos[idx++] = x; pos[idx++] = y; pos[idx++] = z;
  };

  // Human figure scaled to frame camera: Top of head Y=+1.85, Feet Y=-1.75
  // Arms abducted ~45° matching the anatomical mapping diagram

  // ── 1. Cranium, Face & Mandible (Skull: Y ~1.55 to 1.88) ──
  const SKULL_COUNT = Math.floor(count * 0.08);
  for (let i = 0; i < SKULL_COUNT; i++) {
    const theta = rand() * Math.PI;
    const phi = rand() * Math.PI * 2;
    const r = 0.26 + n(0.02);
    add(
      Math.sin(theta) * Math.cos(phi) * r * 0.88,
      1.68 + Math.cos(theta) * r * 1.15,
      Math.sin(theta) * Math.sin(phi) * r * 0.95 + 0.02
    );
  }

  // ── 2. Clavicle (Collarbone, Left & Right: Y ~1.26) ──
  const CLAV_COUNT = Math.floor(count * 0.03);
  for (let i = 0; i < CLAV_COUNT; i++) {
    const side = rand() > 0.5 ? 1 : -1;
    const t = rand(); // 0 = sternum joint, 1 = acromion shoulder joint
    const cx = side * (0.06 + t * 0.52);
    const cy = 1.28 - t * 0.06;
    const cz = 0.16 + Math.sin(t * Math.PI) * 0.06;
    add(cx + n(0.015), cy, cz);
  }

  // ── 3. Shoulder Joint (Articulatio Humeri, [±0.62, 1.22, 0.06]) ──
  const SH_COUNT = Math.floor(count * 0.04);
  for (let i = 0; i < SH_COUNT; i++) {
    const side = rand() > 0.5 ? 1 : -1;
    const a = rand() * Math.PI * 2;
    const r = rand() * 0.12;
    add(side * (0.62 + Math.cos(a) * r), 1.22 + Math.sin(a) * r, 0.06 + (rand() - 0.5) * 0.10);
  }

  // ── 4. Thoracic Ribcage (12 Rib Pairs, Y ~0.50 to 1.22) ──
  const RIBS_COUNT = Math.floor(count * 0.16);
  for (let i = 0; i < RIBS_COUNT; i++) {
    const ribIdx = Math.floor(rand() * 12);
    const ry = 0.52 + (ribIdx / 12) * 0.68;
    const side = rand() > 0.5 ? 1 : -1;
    const t = rand(); // 0 = spine attachment, 1 = sternum/cartilage
    const sweep = t * Math.PI * 0.82;
    const chestW = (0.34 + Math.sin((ribIdx / 12) * Math.PI) * 0.28) * 1.22;
    const chestD = 0.32;
    const rx = side * Math.sin(sweep) * chestW;
    const rz = -Math.cos(sweep) * chestD + 0.14;
    add(rx + n(0.02), ry - t * 0.06, rz);
  }

  // ── 5. Spine (Thorax & Lumbar Vertebrae with Natural S-Curve) ──
  const SPINE_COUNT = Math.floor(count * 0.06);
  for (let i = 0; i < SPINE_COUNT; i++) {
    const t = i / SPINE_COUNT;
    const sy = 1.35 - t * 1.15; // from cervical to sacrum
    const sCurveZ = Math.sin(t * Math.PI * 2.2) * 0.06 - 0.08; // posterior
    const a = rand() * Math.PI * 2;
    const r = 0.055 + rand() * 0.02;
    add(Math.cos(a) * r, sy, sCurveZ + Math.sin(a) * r);
  }

  // ── 6. Pumping Heart Core & Vascular Network (Red/Magenta Glow) ──
  const HEART_COUNT = Math.floor(count * 0.06);
  for (let i = 0; i < HEART_COUNT; i++) {
    const u = rand() * Math.PI * 2;
    const v = rand() * Math.PI;
    const hr = 0.14 + rand() * 0.035;
    // Positioned inside chest cavity, tilted slightly to left side
    add(-0.06 + Math.cos(u) * Math.sin(v) * hr * 1.1, 0.92 + Math.cos(v) * hr * 1.25, 0.18 + Math.sin(u) * Math.sin(v) * hr);
  }
  // Thoracic aorta & major vessels
  for (let i = 0; i < Math.floor(count * 0.03); i++) {
    const t = rand();
    const vy = 1.20 - t * 0.95;
    const side = rand() > 0.5 ? 0.03 : -0.03;
    add(side, vy, 0.08 + (rand() - 0.5) * 0.04);
  }

  // ── 7. Muscular Envelope: Chest (Pectoralis Major) & Abdominals ──
  const CHEST_COUNT = Math.floor(count * 0.08);
  for (let i = 0; i < CHEST_COUNT; i++) {
    const side = rand() > 0.5 ? 1 : -1;
    const t = rand();
    const py = 0.85 + t * 0.35;
    // Fan-shaped pectoral muscle contour
    const px = side * (0.12 + Math.sin(t * Math.PI) * 0.36);
    add(px + n(0.03), py + n(0.02), 0.28 + n(0.04));
  }

  // ── 8. Arms: Humerus, Biceps Brachii, Elbow Joint, Forearm ──
  // Abducted ~45° matching reference diagram
  const ARMS_COUNT = Math.floor(count * 0.14);
  for (let i = 0; i < ARMS_COUNT; i++) {
    const side = rand() > 0.5 ? 1 : -1;
    const t = rand(); // 0 = shoulder, 1 = hand
    let ax, ay, az;
    if (t < 0.45) {
      // Upper arm / Humerus & Biceps Brachii muscle
      const f = t / 0.45;
      ax = side * (0.62 + f * 0.42);
      ay = 1.20 - f * 0.55; // slopes down & out
      az = 0.06 + (rand() - 0.5) * 0.12;
      // Thicker in middle for Biceps Brachii muscle belly
      const bBulge = Math.sin(f * Math.PI) * 0.06;
      add(ax + n(0.02), ay, az + bBulge);
    } else if (t < 0.55) {
      // Elbow Joint (Articulatio Cubiti: [±1.08, 0.62, 0.06])
      const f = (t - 0.45) / 0.10;
      ax = side * (1.04 + f * 0.08);
      ay = 0.65 - f * 0.06;
      az = 0.06 + (rand() - 0.5) * 0.08;
      add(ax + n(0.02), ay, az);
    } else {
      // Forearm & Hand
      const f = (t - 0.55) / 0.45;
      ax = side * (1.12 + f * 0.52);
      ay = 0.58 - f * 0.65;
      az = 0.06 + (rand() - 0.5) * 0.08;
      add(ax + n(0.02), ay, az);
    }
  }

  // ── 9. Pelvis (Ilium & Sacrum: Y ~0.25 to 0.00) ──
  const PELVIS_COUNT = Math.floor(count * 0.07);
  for (let i = 0; i < PELVIS_COUNT; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.38 + n(0.03);
    const crestY = Math.cos(a * 2) * 0.08;
    add(Math.cos(a) * r * 1.15, 0.18 + crestY, Math.sin(a) * r * 0.75 + 0.02);
  }

  // ── 10. Femur (Thigh Bone) & Lower Limbs (Y ~0.10 to -1.75) ──
  const LEGS_COUNT = Math.floor(count * 0.12);
  for (let i = 0; i < LEGS_COUNT; i++) {
    const side = rand() > 0.5 ? 1 : -1;
    const t = rand();
    if (t < 0.50) {
      // Femur / Thigh
      const f = t / 0.50;
      const lx = side * (0.24 + f * 0.06);
      const ly = 0.10 - f * 0.90; // 0.10 to -0.80
      add(lx + n(0.03), ly, 0.04 + (rand() - 0.5) * 0.14);
    } else {
      // Knee joint, Tibia & Feet
      const f = (t - 0.50) / 0.50;
      const lx = side * (0.30 - f * 0.06);
      const ly = -0.80 - f * 0.92;
      add(lx + n(0.03), ly, 0.04 + (rand() - 0.5) * 0.12);
    }
  }

  // Fill remaining particles into outer body translucent contour
  while (idx < count * 3) {
    const side = rand() > 0.5 ? 1 : -1;
    const y = -1.70 + rand() * 3.50;
    add(side * rand() * 0.65, y, (rand() - 0.5) * 0.40);
  }

  return pos;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  3. Commercial Airliner — "AI AIRCRAFT PART SEGMENTATION & AERODYNAMIC MAPPING" */
/* ─────────────────────────────────────────────────────────────────────────── */
export function generatePlanePoints(count = MODEL_COUNT) {
  const pos = new Float32Array(count * 3);
  let idx = 0;

  const add = (x, y, z) => {
    if (idx >= count * 3) return;
    pos[idx++] = x; pos[idx++] = y; pos[idx++] = z;
  };

  // Aircraft Dimensions: Length X: +2.85 (Nose) to -2.75 (Tail); Wingspan Z: +/-3.3; Height Y: -0.65 to +1.60

  // ── 1. Radome (Radar Nose Cone: X: 2.85 to 2.15) ──
  const RD_COUNT = Math.floor(count * 0.045);
  for (let i = 0; i < RD_COUNT; i++) {
    const t = rand(); // 0 = apex tip, 1 = fuselage joint
    const x = 2.85 - t * 0.70;
    const rMax = 0.42 * Math.sin(t * Math.PI * 0.5);
    const a = rand() * Math.PI * 2;
    add(x, Math.sin(a) * rMax, Math.cos(a) * rMax);
  }

  // ── 2. Flight Deck (Cockpit with Pilot Seats & Windshield: X: 2.15 to 1.65) ──
  const CK_COUNT = Math.floor(count * 0.06);
  for (let i = 0; i < CK_COUNT; i++) {
    const part = rand();
    if (part < 0.45) {
      // Cockpit windshield structural frames (six windows)
      const a = (rand() - 0.5) * Math.PI * 0.75;
      const x = 2.05 + Math.cos(a) * 0.12;
      const y = 0.16 + Math.sin(a) * 0.22;
      const z = Math.sin(a) * 0.38;
      add(x, y, z);
    } else {
      // Pilot & Co-pilot seats + central instrument pedestal
      const side = rand() > 0.5 ? 0.18 : -0.18;
      const sx = 1.85 + (rand() - 0.5) * 0.16;
      const sy = 0.05 + (rand() - 0.5) * 0.18;
      add(sx, sy, side + n(0.02));
    }
  }

  // ── 3. Passenger Cabin Cutaway (Seats Rows & Aisle visible inside: X: 1.65 to -1.35) ──
  const CB_COUNT = Math.floor(count * 0.16);
  for (let i = 0; i < CB_COUNT; i++) {
    const part = rand();
    if (part < 0.60) {
      // Interior passenger seat rows (Left & Right of center aisle)
      const rowIdx = Math.floor(rand() * 14); // 14 seat rows
      const sx = 1.45 - (rowIdx / 14) * 2.60;
      const isLeft = rand() > 0.5;
      const seatPos = isLeft ? -0.22 - rand() * 0.14 : 0.22 + rand() * 0.14;
      add(sx + n(0.02), -0.02 + rand() * 0.18, seatPos);
    } else {
      // Cabin floor deck
      const fx = 1.50 - rand() * 2.70;
      const fz = (rand() - 0.5) * 0.78;
      add(fx, -0.12 + n(0.015), fz);
    }
  }

  // ── 4. Lower Belly Cargo Hold & Rear APU (Auxiliary Power Unit) ──
  const CG_COUNT = Math.floor(count * 0.05);
  for (let i = 0; i < CG_COUNT; i++) {
    const isAPU = rand() < 0.35;
    if (isAPU) {
      // APU turbine generator in tail cone (X: -2.40 to -2.75)
      const ax = -2.40 - rand() * 0.35;
      const a = rand() * Math.PI * 2;
      add(ax, Math.sin(a) * 0.12 + 0.12, Math.cos(a) * 0.12);
    } else {
      // Cargo Hold luggage pallets in lower fuselage belly
      const cx = 1.20 - rand() * 2.20;
      const cz = (rand() - 0.5) * 0.55;
      add(cx, -0.28 + n(0.03), cz);
    }
  }

  // ── 5. Translucent Fuselage Shell with Passenger Window Line ──
  const FS_COUNT = Math.floor(count * 0.14);
  for (let i = 0; i < FS_COUNT; i++) {
    const t = rand();
    const x = 2.15 - t * 4.45; // 2.15 to -2.30
    const a = rand() * Math.PI * 2;
    const r = 0.42;
    // Window line cutaway strip on both sides
    const isWindow = (Math.abs(Math.sin(a)) < 0.22 && Math.cos(a) > 0);
    const opacityR = isWindow ? r : r + n(0.015);
    add(x, Math.sin(a) * opacityR, Math.cos(a) * opacityR);
  }

  // ── 6. Swept Main Wings with Flaps, Slats & Ailerons ──
  const WG_COUNT = Math.floor(count * 0.22);
  for (let i = 0; i < WG_COUNT; i++) {
    const side = rand() > 0.5 ? 1 : -1;
    const spanT = rand(); // 0 = wing root, 1 = wingtip
    const z = side * (0.42 + spanT * 2.85); // extends to Z: +/-3.27
    // Swept back ~28 degrees
    const sweepX = 0.52 - spanT * 1.55;
    const chord = 0.95 * (1.0 - spanT * 0.68);
    const x = sweepX + (rand() - 0.5) * chord;
    // Dihedral upward slope
    const y = -0.10 + spanT * 0.22;

    add(x + n(0.02), y + n(0.015), z);
  }

  // ── 7. Winglets at Wingtips (Drag Reduction & Roll Control) ──
  const WL_COUNT = Math.floor(count * 0.04);
  for (let i = 0; i < WL_COUNT; i++) {
    const side = rand() > 0.5 ? 1 : -1;
    const t = rand(); // 0 = wingtip, 1 = winglet tip
    const z = side * (3.24 + t * 0.08);
    const wy = 0.12 + t * 0.58; // tall curved blended winglet
    const wx = -1.05 - t * 0.18 + (rand() - 0.5) * 0.18;
    add(wx, wy, z);
  }

  // ── 8. Under-Wing High-Bypass Turbofan Engines with Spinning Fan Blades ──
  const EG_COUNT = Math.floor(count * 0.12);
  const engineZPositions = [1.25, -1.25]; // Left & Right engines
  for (let i = 0; i < EG_COUNT; i++) {
    const eZ = engineZPositions[i % 2];
    const part = rand();
    if (part < 0.65) {
      // Nacelle cylindrical cowling (Length ~0.95, Diameter ~0.50)
      const t = rand();
      const ex = 0.65 - t * 0.95; // 0.65 to -0.30
      const a = rand() * Math.PI * 2;
      const er = 0.24 + Math.sin(t * Math.PI) * 0.02;
      add(ex, -0.42 + Math.sin(a) * er, eZ + Math.cos(a) * er);
    } else {
      // Intake spinner cone & spinning fan blade ring
      const a = rand() * Math.PI * 2;
      const fr = rand() * 0.22;
      add(0.66 + (1 - fr / 0.22) * 0.08, -0.42 + Math.sin(a) * fr, eZ + Math.cos(a) * fr);
    }
  }

  // ── 9. Tricycle Landing Gear (Nose Gear & Dual Main Gear Bogies) ──
  const LG_COUNT = Math.floor(count * 0.035);
  for (let i = 0; i < LG_COUNT; i++) {
    const isNose = rand() < 0.35;
    if (isNose) {
      // Steerable twin nose wheels at X: 1.85, Y: -0.65
      const side = rand() > 0.5 ? 0.05 : -0.05;
      const a = rand() * Math.PI * 2;
      const r = 0.11;
      add(1.85 + Math.cos(a) * r, -0.58 + Math.sin(a) * r, side);
    } else {
      // Main 4-wheel bogies under wing roots
      const side = rand() > 0.5 ? 0.82 : -0.82;
      const wheelX = rand() > 0.5 ? -0.22 : -0.42;
      const a = rand() * Math.PI * 2;
      const r = 0.13;
      add(wheelX + Math.cos(a) * r, -0.62 + Math.sin(a) * r, side + (rand() - 0.5) * 0.10);
    }
  }

  // ── 10. Empennage: Vertical Stabilizer Tail Fin with Rudder & Horizontal Stabilizer ──
  const TL_COUNT = Math.floor(count * 0.09);
  for (let i = 0; i < TL_COUNT; i++) {
    const isVertical = rand() < 0.60;
    if (isVertical) {
      // Tall swept vertical tail fin (Y: 0.35 to 1.55) & Rudder
      const ht = rand();
      const vy = 0.35 + ht * 1.20;
      const vSweep = -1.75 - ht * 0.90;
      const chord = 0.85 * (1.0 - ht * 0.65);
      const vx = vSweep + (rand() - 0.5) * chord;
      add(vx, vy, (rand() - 0.5) * 0.06);
    } else {
      // Horizontal stabilizer tailplane
      const side = rand() > 0.5 ? 1 : -1;
      const spanT = rand();
      const hz = side * (0.20 + spanT * 1.05);
      const hSweep = -2.25 - spanT * 0.45;
      const chord = 0.52 * (1.0 - spanT * 0.50);
      const hx = hSweep + (rand() - 0.5) * chord;
      add(hx, 0.28 + n(0.015), hz);
    }
  }

  // Fill remaining particles into fuselage surface
  while (idx < count * 3) {
    const t = rand();
    const x = 2.40 - t * 4.80;
    const a = rand() * Math.PI * 2;
    add(x, Math.sin(a) * 0.42, Math.cos(a) * 0.42);
  }

  return pos;
}
