/**
 * WonderSnap — 3D Holographic Technical Part Labels System
 * Matches the exact technical blueprint HUD layouts from the 4 reference images:
 * - AI Human Body Part Segmentation & Anatomical Mapping
 * - AI Vehicle Part Segmentation - Royal Enfield
 * - AI Vehicle Part Segmentation - BMW M4 Competition
 * - AI Aircraft Part Segmentation & Aerodynamic Mapping
 */

import * as THREE from 'three';

export const MODEL_CONFIGS = {
  human: {
    bannerTitle: 'AI HUMAN BODY PART SEGMENTATION & ANATOMICAL MAPPING',
    category: 'ANATOMY & BIOMECHANICS',
    modelTitle: 'Human Musculoskeletal & Organs',
    modelDesc: 'Full-body segmentation: articulated skeleton, muscular groups & heart',
    parts: [
      // Left Screen Side
      {
        name: 'SHOULDER JOINT',
        sub: '(Articulatio humeri)',
        id: '#44872',
        acc: '99.4%',
        depth: '14.2cm',
        cls: 'Skeletal / Joint Group',
        pos: [ 0.62,  1.22,  0.08],
        side: 'left',
        color: '#00f0ff'
      },
      {
        name: 'HUMERUS',
        sub: '(Upper Arm Bone)',
        id: '#44812',
        acc: '99.4%',
        depth: '14.2cm',
        cls: 'Skeletal / Limb Bone',
        pos: [ 0.85,  0.92,  0.06],
        side: 'left',
        color: '#00f0ff'
      },
      {
        name: 'BICEPS BRACHII',
        sub: '(Muscle Belly)',
        id: '#14512',
        acc: '98.8%',
        depth: '12.4cm',
        cls: 'Skeletal / Muscle Group',
        pos: [ 0.78,  0.88,  0.18],
        side: 'left',
        color: '#ff0077'
      },
      {
        name: 'RIBCAGE',
        sub: '(Thorax Cage)',
        id: '#44812',
        acc: '99.4%',
        depth: '14.2cm',
        cls: 'Skeletal / Thoracic',
        pos: [ 0.42,  0.78,  0.14],
        side: 'left',
        color: '#00f0ff'
      },
      {
        name: 'SPINE',
        sub: '(Thoracic Column)',
        id: '#44512',
        acc: '99.4%',
        depth: '14.2cm',
        cls: 'Skeletal / Axial Group',
        pos: [ 0.00,  0.45, -0.08],
        side: 'left',
        color: '#00f0ff'
      },

      // Right Screen Side
      {
        name: 'CLAVICLE',
        sub: '(Collarbone)',
        id: '#44872',
        acc: '99.4%',
        depth: '14.2cm',
        cls: 'Skeletal / Pectoral Girdle',
        pos: [-0.32,  1.26,  0.16],
        side: 'right',
        color: '#00f0ff'
      },
      {
        name: 'CHEST',
        sub: '(Pectoralis Major)',
        id: '#44835',
        acc: '99.4%',
        depth: '14.2cm',
        cls: 'Skeletal / Muscle Group',
        pos: [-0.28,  0.98,  0.28],
        side: 'right',
        color: '#00ff88'
      },
      {
        name: 'HEART & AORTA',
        sub: '(Cardiovascular)',
        id: '#88912',
        acc: '99.8%',
        depth: '16.5cm',
        cls: 'Cardiovascular Core',
        pos: [-0.06,  0.92,  0.18],
        side: 'right',
        color: '#ff2255'
      },
      {
        name: 'ELBOW JOINT',
        sub: '(Articulatio cubiti)',
        id: '#44812',
        acc: '99.4%',
        depth: '15.2cm',
        cls: 'Skeletal / Joint',
        pos: [-1.08,  0.62,  0.06],
        side: 'right',
        color: '#00f0ff'
      },
      {
        name: 'PELVIS',
        sub: '(Ilium & Sacrum)',
        id: '#44812',
        acc: '99.4%',
        depth: '14.2cm',
        cls: 'Skeletal / Pelvic Girdle',
        pos: [-0.35,  0.18,  0.10],
        side: 'right',
        color: '#00f0ff'
      },
      {
        name: 'FEMUR',
        sub: '(Thigh Bone)',
        id: '#44812',
        acc: '99.1%',
        depth: '14.2cm',
        cls: 'Skeletal / Lower Limb',
        pos: [-0.28, -0.42,  0.06],
        side: 'right',
        color: '#00f0ff'
      }
    ]
  },

  bike: {
    bannerTitle: 'AI VEHICLE PART SEGMENTATION & MECHANICAL MAPPING - ROYAL ENFIELD',
    category: 'MOTORCYCLE ENGINEERING',
    modelTitle: 'Royal Enfield Classic 350',
    modelDesc: 'Mechanical segmentation: air-cooled engine, double cradle frame & suspension',
    parts: [
      // Left Screen Side
      {
        name: 'FUEL TANK',
        sub: '(Teardrop Tank)',
        id: '#99842',
        acc: '99.7%',
        depth: '16.2cm',
        cls: 'Structural / Sheet Metal',
        pos: [ 0.35,  0.42,  0.26],
        side: 'left',
        color: '#ffcc00'
      },
      {
        name: 'RIDER SEAT',
        sub: '(Sprung Solo Seat)',
        id: '#14512',
        acc: '98.7%',
        depth: '16.2cm',
        cls: 'Ergonomic / Interior',
        pos: [-0.52,  0.28,  0.18],
        side: 'left',
        color: '#00f0ff'
      },
      {
        name: 'REAR SHOCK ABSORBER',
        sub: '(Dual Coil Spring)',
        id: '#14542',
        acc: '98.7%',
        depth: '16.2cm',
        cls: 'Chassis / Suspension',
        pos: [-0.95, -0.15,  0.22],
        side: 'left',
        color: '#00f0ff'
      },
      {
        name: 'AIR FILTER BOX',
        sub: '(Side Toolbox Canister)',
        id: '#94842',
        acc: '98.7%',
        depth: '16.2cm',
        cls: 'Powertrain / Intake',
        pos: [-0.25, -0.05,  0.24],
        side: 'left',
        color: '#ffcc00'
      },
      {
        name: 'DOUBLE CRADLE',
        sub: '(Tubular Steel Frame)',
        id: '#46012',
        acc: '98.7%',
        depth: '15.5cm',
        cls: 'Chassis / Structural',
        pos: [ 0.35, -0.35,  0.12],
        side: 'left',
        color: '#00f0ff'
      },
      {
        name: 'EXHAUST PIPE',
        sub: '(Torpedo Silencer)',
        id: '#9842',
        acc: '98.7%',
        depth: '13.5cm',
        cls: 'Powertrain / Exhaust',
        pos: [-0.75, -0.40,  0.28],
        side: 'left',
        color: '#ffffff'
      },

      // Right Screen Side
      {
        name: 'HEADLIGHT ASSEMBLY',
        sub: '(Classic Visor Cowl)',
        id: '#99825',
        acc: '99.7%',
        depth: '18.2cm',
        cls: 'Electrical / Optical',
        pos: [ 1.52,  0.75,  0.00],
        side: 'right',
        color: '#ffcc00'
      },
      {
        name: 'FRONT FORK',
        sub: '(Telescopic Suspension)',
        id: '#9842',
        acc: '98.7%',
        depth: '21.2cm',
        cls: 'Chassis / Suspension',
        pos: [ 1.25,  0.15,  0.16],
        side: 'right',
        color: '#00f0ff'
      },
      {
        name: 'ENGINE BLOCK',
        sub: '(Air-Cooled Single)',
        id: '#99012',
        acc: '99.7%',
        depth: '15.8cm',
        cls: 'Powertrain / Engine',
        pos: [ 0.24,  0.08,  0.18],
        side: 'right',
        color: '#ff8800'
      },
      {
        name: 'GEARBOX',
        sub: '(5-Speed Transmission)',
        id: '#46012',
        acc: '99.7%',
        depth: '14.5cm',
        cls: 'Powertrain / Drivetrain',
        pos: [-0.08, -0.32,  0.18],
        side: 'right',
        color: '#00f0ff'
      }
    ]
  },

  car: {
    bannerTitle: 'AI VEHICLE PART SEGMENTATION & MECHANICAL MAPPING - BMW M4 COMPETITION',
    category: 'AUTOMOTIVE AERODYNAMICS',
    modelTitle: 'BMW M4 Competition Coupe',
    modelDesc: 'Powertrain cutaway: 3.0L S58 Twin-Turbo I6, M bucket seats & carbon roof',
    parts: [
      // Left Screen Side
      {
        name: 'CARBON FIBRE ROOF',
        sub: '(Aerodynamic Channel)',
        id: '#48542',
        acc: '99.1%',
        depth: '11.2cm',
        cls: 'Body / Carbon Composite',
        pos: [-0.15,  0.78,  0.42],
        side: 'left',
        color: '#00f0ff'
      },
      {
        name: '3.0L TWIN-TURBO I6',
        sub: '(S58 Engine + Strut)',
        id: '#88585',
        acc: '99.1%',
        depth: '14.2cm',
        cls: 'Powertrain / Mechanical',
        pos: [ 1.35,  0.05,  0.18],
        side: 'left',
        color: '#ff8800'
      },
      {
        name: '8-SPEED M STEPTRONIC',
        sub: '(Driveline Transmission)',
        id: '#48342',
        acc: '99.1%',
        depth: '15.5cm',
        cls: 'Powertrain / Gearbox',
        pos: [ 0.35, -0.32,  0.10],
        side: 'left',
        color: '#00f0ff'
      },
      {
        name: 'ACTIVE M DIFFERENTIAL',
        sub: '(Rear Axle Differential)',
        id: '#88582',
        acc: '99.1%',
        depth: '15.5cm',
        cls: 'Powertrain / Axle',
        pos: [-1.42, -0.38,  0.15],
        side: 'left',
        color: '#00f0ff'
      },
      {
        name: 'BMW LASERLIGHT',
        sub: '(Hexagonal DRL Halos)',
        id: '#88852',
        acc: '99.7%',
        depth: '15.5cm',
        cls: 'Electrical / Laser Optics',
        pos: [ 2.28,  0.04,  0.65],
        side: 'left',
        color: '#00f0ff'
      },
      {
        name: 'FRONT SPLITTER',
        sub: '(Carbon Aero Lip)',
        id: '#48542',
        acc: '98.4%',
        depth: '13.2cm',
        cls: 'Aerodynamics / Splitter',
        pos: [ 2.44, -0.56,  0.45],
        side: 'left',
        color: '#ffffff'
      },

      // Right Screen Side
      {
        name: 'M CARBON BUCKET SEATS',
        sub: '(Cockpit Interior)',
        id: '#48542',
        acc: '99.1%',
        depth: '14.2cm',
        cls: 'Interior / Carbon Body',
        pos: [-0.05,  0.35, -0.38],
        side: 'right',
        color: '#ffaa00'
      },
      {
        name: 'CARBON REAR DIFFUSER',
        sub: '(Quad M Exhaust Tips)',
        id: '#88845',
        acc: '98.7%',
        depth: '15.5cm',
        cls: 'Aerodynamics / Exhaust',
        pos: [-2.36, -0.52, -0.45],
        side: 'right',
        color: '#00f0ff'
      },
      {
        name: 'M SPORT SUSPENSION',
        sub: '(Adaptive M Coilovers)',
        id: '#48545',
        acc: '99.1%',
        depth: '14.2cm',
        cls: 'Chassis / Suspension',
        pos: [ 1.48, -0.15, -0.85],
        side: 'right',
        color: '#00f0ff'
      },
      {
        name: 'M COMPOUND BRAKES',
        sub: '(Carbon Ceramic Disc)',
        id: '#44842',
        acc: '99.4%',
        depth: '14.2cm',
        cls: 'Braking / Rotor & Caliper',
        pos: [ 1.52, -0.42, -0.90],
        side: 'right',
        color: '#ff0055'
      },
      {
        name: '19"/20" FORGED M WHEEL',
        sub: '(Double-Spoke Star Rim)',
        id: '#48845',
        acc: '99.1%',
        depth: '14.2cm',
        cls: 'Running Gear / Wheels',
        pos: [-1.42, -0.40, -0.96],
        side: 'right',
        color: '#00f0ff'
      }
    ]
  },

  plane: {
    bannerTitle: 'AI AIRCRAFT PART SEGMENTATION & AERODYNAMIC MAPPING',
    category: 'COMMERCIAL AEROSPACE',
    modelTitle: 'Commercial Jetliner A320',
    modelDesc: 'Cutaway view: flight deck, passenger cabin rows, turbofans & winglets',
    parts: [
      // Left Screen Side
      {
        name: 'HORIZONTAL STABILIZER',
        sub: '(Pitch Control Tailplane)',
        id: '#7745',
        acc: '99.5%',
        depth: '16.2cm',
        cls: 'Aerodynamic / Empennage',
        pos: [-2.25,  0.28,  0.85],
        side: 'left',
        color: '#00f0ff'
      },
      {
        name: 'FUSELAGE',
        sub: '(Main Pressurized Body)',
        id: '#47745',
        acc: '99.2%',
        depth: '16.2cm',
        cls: 'Airframe / Structure',
        pos: [ 0.25,  0.35,  0.42],
        side: 'left',
        color: '#00f0ff'
      },
      {
        name: 'FLIGHT DECK',
        sub: '(Cockpit Glass Displays)',
        id: '#7745',
        acc: '99.5%',
        depth: '12.5cm',
        cls: 'Avionics / Flight Crew',
        pos: [ 1.95,  0.15,  0.22],
        side: 'left',
        color: '#ffcc00'
      },
      {
        name: 'RADOME',
        sub: '(Weather Radar Cone)',
        id: '#47745',
        acc: '98.6%',
        depth: '12.5cm',
        cls: 'Avionics / Weather Radar',
        pos: [ 2.70,  0.00,  0.08],
        side: 'left',
        color: '#00f0ff'
      },
      {
        name: 'LANDING GEAR',
        sub: '(Nose & Main Bogies)',
        id: '#49942',
        acc: '98.6%',
        depth: '13.2cm',
        cls: 'Mechanical / Undercarriage',
        pos: [ 1.85, -0.60,  0.05],
        side: 'left',
        color: '#00ff88'
      },
      {
        name: 'APU',
        sub: '(Auxiliary Power Unit)',
        id: '#7745',
        acc: '98.5%',
        depth: '14.5cm',
        cls: 'Power Plant / Auxiliary',
        pos: [-2.55,  0.12,  0.00],
        side: 'left',
        color: '#ff8800'
      },

      // Right Screen Side
      {
        name: 'VERTICAL STABILIZER',
        sub: '(Swept Tail Fin)',
        id: '#7745',
        acc: '99.6%',
        depth: '16.2cm',
        cls: 'Aerodynamic / Empennage',
        pos: [-1.95,  1.15, -0.05],
        side: 'right',
        color: '#00f0ff'
      },
      {
        name: 'RUDDER',
        sub: '(Yaw Control Surface)',
        id: '#7745',
        acc: '99.5%',
        depth: '14.5cm',
        cls: 'Flight Control / Rudder',
        pos: [-2.35,  0.85, -0.05],
        side: 'right',
        color: '#00f0ff'
      },
      {
        name: 'WINGLET',
        sub: '(Drag Reduction Wingtip)',
        id: '#7745',
        acc: '99.5%',
        depth: '14.5cm',
        cls: 'Aerodynamics / Winglet',
        pos: [-1.15,  0.52, -3.25],
        side: 'right',
        color: '#00f0ff'
      },
      {
        name: 'FLAPS & SLATS',
        sub: '(High-Lift Devices)',
        id: '#44912',
        acc: '98.2%',
        depth: '14.5cm',
        cls: 'Aerodynamic / Lift Control',
        pos: [-0.45, -0.08, -1.85],
        side: 'right',
        color: '#00f0ff'
      },
      {
        name: 'AILERON',
        sub: '(Roll Control Surface)',
        id: '#47745',
        acc: '99.5%',
        depth: '14.5cm',
        cls: 'Flight Control / Aileron',
        pos: [-0.95,  0.05, -2.65],
        side: 'right',
        color: '#00f0ff'
      },
      {
        name: 'TURBOFAN ENGINE',
        sub: '(High-Bypass Nacelle)',
        id: '#47745',
        acc: '99.2%',
        depth: '14.5cm',
        cls: 'Propulsion / Jet Turbine',
        pos: [ 0.35, -0.42, -1.25],
        side: 'right',
        color: '#ffaa00'
      },
      {
        name: 'CARGO HOLD',
        sub: '(Lower Belly Hold)',
        id: '#7745',
        acc: '98.5%',
        depth: '14.5cm',
        cls: 'Interior / Cargo Freight',
        pos: [ 0.15, -0.28, -0.25],
        side: 'right',
        color: '#00ff88'
      }
    ]
  }
};

/* ─────────────────────────────────────────────────────────────────────────── */
export class LabelsManager {
  constructor(threeCamera) {
    this.camera = threeCamera;
    this.currentKey = 'human';
    this.active = true;
    this._vec = new THREE.Vector3();

    /* Overlay container */
    this.overlay = document.createElement('div');
    this.overlay.id = 'labels-overlay';
    Object.assign(this.overlay.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '15',
      overflow: 'hidden',
    });
    document.body.appendChild(this.overlay);

    /* SVG canvas for connector lines */
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    Object.assign(this.svg.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    });
    this.overlay.appendChild(this.svg);

    this._entries = {};
    this._buildLabels();
  }

  setModel(key) {
    if (this.currentKey === key && Object.keys(this._entries).length > 0) return;
    this.currentKey = key;
    this._buildLabels();

    const bannerTitle = document.getElementById('blueprint-title-text');
    const config = MODEL_CONFIGS[key] || MODEL_CONFIGS.human;
    if (bannerTitle && config.bannerTitle) {
      bannerTitle.textContent = config.bannerTitle;
    }
  }

  _buildLabels() {
    this.overlay.querySelectorAll('.lbl-card').forEach((el) => el.remove());
    while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
    this._entries = {};

    const config = MODEL_CONFIGS[this.currentKey] || MODEL_CONFIGS.human;
    const parts = config.parts || [];

    // Also update banner title
    const bannerTitle = document.getElementById('blueprint-title-text');
    if (bannerTitle && config.bannerTitle) {
      bannerTitle.textContent = config.bannerTitle;
    }

    parts.forEach((part, idx) => {
      // 1. Sci-fi HUD Callout Box matching reference blueprint
      const card = document.createElement('div');
      card.className = `lbl-card lbl-${part.side}`;
      card.innerHTML = `
        <div class="lbl-card-inner">
          <div class="lbl-header-row">
            <span class="lbl-dot" style="background:${part.color || '#00f0ff'}; box-shadow: 0 0 8px ${part.color || '#00f0ff'}"></span>
            <span class="lbl-main-title">${part.name}</span>
            ${part.sub ? `<span class="lbl-sub-title">${part.sub}</span>` : ''}
          </div>
          <div class="lbl-meta-block">
            <div class="lbl-line"><span class="lbl-k">ID:</span> <span class="lbl-v">${part.id || '#44872'}</span></div>
            <div class="lbl-line"><span class="lbl-k">Accuracy:</span> <span class="lbl-v">${part.acc || '99.4%'}</span></div>
            ${part.depth ? `<div class="lbl-line"><span class="lbl-k">Depth:</span> <span class="lbl-v">${part.depth}</span></div>` : ''}
            ${part.cls ? `<div class="lbl-line"><span class="lbl-k">Class:</span> <span class="lbl-v">${part.cls}</span></div>` : ''}
          </div>
          <div class="lbl-corner-tl"></div>
          <div class="lbl-corner-br"></div>
        </div>
      `;
      this.overlay.appendChild(card);

      // 2. Dog-leg Technical SVG connector line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      line.setAttribute('stroke', part.color || 'rgba(0, 240, 255, 0.7)');
      line.setAttribute('stroke-width', '1.2');
      line.setAttribute('fill', 'none');
      line.setAttribute('opacity', '0.85');
      this.svg.appendChild(line);

      // 3. Anchor dot at 3D anchor position
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '3.5');
      dot.setAttribute('fill', part.color || '#00f0ff');
      dot.setAttribute('stroke', '#ffffff');
      dot.setAttribute('stroke-width', '1.5');
      this.svg.appendChild(dot);

      this._entries[idx] = { card, line, dot, part };
    });
  }

  /**
   * Updates label positions every frame
   * Applies smooth model rotation matching the vertex shader rotation
   * Features collision-avoidance layout so labels never overlap
   */
  update(rotX = 0, rotY = 0, time = 0) {
    if (!this.active) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const config = MODEL_CONFIGS[this.currentKey] || MODEL_CONFIGS.human;
    const parts = config.parts || [];

    // Match vertex shader rotation (uModelRotY + autoSpin, then uModelRotX)
    const autoSpin = time * 0.25;
    const totalRotY = rotY + autoSpin;
    const cosY = Math.cos(totalRotY);
    const sinY = Math.sin(totalRotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    const projectedList = [];

    parts.forEach((part, idx) => {
      const entry = this._entries[idx];
      if (!entry) return;

      // Start with original 3D part coordinate
      const px = part.pos[0];
      const py = part.pos[1];
      const pz = part.pos[2];

      // Rotate Y (yaw)
      const x1 = px * cosY + pz * sinY;
      const y1 = py;
      const z1 = -px * sinY + pz * cosY;

      // Rotate X (pitch)
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      this._vec.set(x2, y2, z2);

      // Project world -> screen NDC -> pixel coords
      this._vec.project(this.camera);

      const sx = (this._vec.x * 0.5 + 0.5) * W;
      const sy = (-this._vec.y * 0.5 + 0.5) * H;

      // Clip if behind camera
      const isBehind = this._vec.z > 1.0;
      if (isBehind) {
        entry.card.style.opacity = '0';
        entry.line.style.opacity = '0';
        entry.dot.style.opacity = '0';
        return;
      }

      projectedList.push({
        entry,
        part,
        sx,
        sy,
        side: part.side
      });
    });

    // Vertical non-overlapping distributed layout
    const leftList = projectedList.filter((p) => p.side === 'left');
    const rightList = projectedList.filter((p) => p.side === 'right');

    const cardW = 226;
    const cardH = 56;
    const minY = 75;
    const maxY = H - 85;
    const availH = maxY - minY;

    // Distribute left column
    leftList.sort((a, b) => a.sy - b.sy);
    if (leftList.length > 0) {
      const step = Math.min(82, availH / leftList.length);
      const totalH = (leftList.length - 1) * step;
      const startY = Math.max(minY, Math.min(maxY - totalH - cardH, (H - totalH - cardH) / 2));
      leftList.forEach((item, i) => {
        item.cardY = startY + i * step;
      });
    }

    // Distribute right column
    rightList.sort((a, b) => a.sy - b.sy);
    if (rightList.length > 0) {
      const step = Math.min(82, availH / rightList.length);
      const totalH = (rightList.length - 1) * step;
      const startY = Math.max(minY, Math.min(maxY - totalH - cardH, (H - totalH - cardH) / 2));
      rightList.forEach((item, i) => {
        item.cardY = startY + i * step;
      });
    }

    const isInspectorCollapsed = document.getElementById('inspector-card')?.classList.contains('collapsed');
    const leftBaseX = isInspectorCollapsed ? 28 : (W > 1150 ? 335 : 24);

    // Render cards and dog-leg SVG lines
    projectedList.forEach(({ entry, part, sx, sy, cardY, side }) => {
      entry.card.style.opacity = '1';
      entry.line.style.opacity = '0.85';
      entry.dot.style.opacity = '1';

      let cardX, lineTargetX, dogLegX;
      if (side === 'left') {
        cardX = Math.max(leftBaseX, Math.min(sx - 105, W * 0.32));
        lineTargetX = cardX + cardW;
        dogLegX = sx - Math.max(16, (sx - lineTargetX) * 0.45);
      } else {
        cardX = Math.min(W - cardW - 24, Math.max(sx + 105, W * 0.72));
        lineTargetX = cardX;
        dogLegX = sx + Math.max(16, (lineTargetX - sx) * 0.45);
      }

      const clampedY = Math.max(minY, Math.min(maxY - cardH, cardY));
      const targetY = clampedY + cardH / 2;

      // Apply transform to label card
      entry.card.style.transform = `translate3d(${cardX}px, ${clampedY}px, 0)`;

      // Technical 3-point dog-leg line: (sx, sy) -> (dogLegX, targetY) -> (lineTargetX, targetY)
      const pointsStr = `${sx},${sy} ${dogLegX},${targetY} ${lineTargetX},${targetY}`;
      entry.line.setAttribute('points', pointsStr);

      // Anchor dot
      entry.dot.setAttribute('cx', sx);
      entry.dot.setAttribute('cy', sy);
    });
  }

  setVisible(visible) {
    this.active = visible;
    this.overlay.style.display = visible ? '' : 'none';
  }

  destroy() {
    this.overlay.remove();
  }
}
