// Twin Harbor — the harbour scene painter and the difference catalogue.
// One scene, drawn twice. The LEFT panel always uses the base variant; the
// RIGHT panel uses a variant with the level's differences switched on. Every
// difference in the catalogue names the flag it flips and the spot (anchor +
// radius, in scene coordinates) where a click counts as finding it.
//
// Scene space is 560 x 520. The game file positions the two panels.

const SCENE_W = 560;
const SCENE_H = 520;

const PALETTES = {
  day: {
    skyTop: '#6ec1e4', skyBottom: '#e8f6f9', seaTop: '#2f83ab', seaBottom: '#175d80',
    sun: '#ffd94d', sunAlt: '#ff9f43', stripe: '#e4572e', stripeAlt: '#2470c7',
    sailAlt: '#e4572e', roofAlt: '#2470c7', shore: '#d9c08a', hill: '#8fc1a9',
    lampGlow: '#ffe9a3', beam: 'rgba(255,240,180,0.20)', star: null,
  },
  sunset: {
    skyTop: '#5b4a8a', skyBottom: '#f7a561', seaTop: '#8a5f8f', seaBottom: '#46355e',
    sun: '#ff8c42', sunAlt: '#ffd94d', stripe: '#c0392b', stripeAlt: '#1e9e6a',
    sailAlt: '#7d3c98', roofAlt: '#1e9e6a', shore: '#b98a5e', hill: '#6d597a',
    lampGlow: '#ffe9a3', beam: 'rgba(255,240,180,0.20)', star: null,
  },
  night: {
    skyTop: '#081c36', skyBottom: '#16324f', seaTop: '#14405f', seaBottom: '#0a2740',
    sun: '#f4f1de', sunAlt: '#f2c14e', stripe: '#e4572e', stripeAlt: '#f1c40f',
    sailAlt: '#e5989b', roofAlt: '#f1c40f', shore: '#5e5648', hill: '#1d3550',
    lampGlow: '#ffdf6b', beam: 'rgba(255,240,180,0.28)', star: '#dfe9ff',
  },
};

// The base picture: every flag off.
function baseVariant() {
  return {
    sunAlt: false, cloudGone: false, birdGone: false, stripeAlt: false,
    sailAlt: false, lampLit: false, flagFlip: false, buoyDrift: false,
    boatGone: false, roofAlt: false, fishLeap: false, beamOut: false,
  };
}

// The catalogue: id -> the variant flag it sets + where it lives in the scene.
const DIFFERENCES = {
  'sun-hue':    { flag: 'sunAlt',    x: 92,  y: 78,  r: 36, label: 'the sun changed colour' },
  'cloud-gone': { flag: 'cloudGone', x: 330, y: 64,  r: 42, label: 'a cloud vanished' },
  'bird-gone':  { flag: 'birdGone',  x: 302, y: 126, r: 26, label: 'one gull is missing' },
  'roof-hue':   { flag: 'roofAlt',   x: 98,  y: 238, r: 30, label: 'a roof changed colour' },
  'lamp-lit':   { flag: 'lampLit',   x: 331, y: 275, r: 22, label: 'a window lit up' },
  'flag-flip':  { flag: 'flagFlip',  x: 510, y: 98,  r: 24, label: 'the flag flies the other way' },
  'stripe-hue': { flag: 'stripeAlt', x: 500, y: 232, r: 32, label: 'the lighthouse stripes changed' },
  'sail-hue':   { flag: 'sailAlt',   x: 152, y: 326, r: 32, label: 'the sail changed colour' },
  'fish-leap':  { flag: 'fishLeap',  x: 255, y: 408, r: 28, label: 'a fish is leaping' },
  'buoy-drift': { flag: 'buoyDrift', x: 92,  y: 424, r: 36, label: 'the buoy drifted' },
  'boat-gone':  { flag: 'boatGone',  x: 456, y: 446, r: 32, label: 'the rowboat is gone' },
  'beam-out':   { flag: 'beamOut',   x: 380, y: 150, r: 40, label: 'the lighthouse beam went out' },
};

function variantWith(diffIds) {
  const v = baseVariant();
  for (const id of diffIds) v[DIFFERENCES[id].flag] = true;
  return v;
}

// ---- small drawing helpers -------------------------------------------------

function cloud(ctx, x, y, s, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, 16 * s, 0, Math.PI * 2);
  ctx.arc(x + 18 * s, y + 3 * s, 12 * s, 0, Math.PI * 2);
  ctx.arc(x - 18 * s, y + 4 * s, 11 * s, 0, Math.PI * 2);
  ctx.arc(x + 4 * s, y - 7 * s, 12 * s, 0, Math.PI * 2);
  ctx.fill();
}

function bird(ctx, x, y, s, colour) {
  ctx.strokeStyle = colour; ctx.lineWidth = 2.4 * s; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 9 * s, y);
  ctx.quadraticCurveTo(x - 3 * s, y - 6 * s, x, y);
  ctx.quadraticCurveTo(x + 3 * s, y - 6 * s, x + 9 * s, y);
  ctx.stroke();
}

// ---- the scene -------------------------------------------------------------

function drawScene(ctx, pal, v, seed) {
  const rng = makeRng(seed);
  // Sky and sea.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, pal.skyTop); sky.addColorStop(1, pal.skyBottom);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, SCENE_W, 302);
  const sea = ctx.createLinearGradient(0, 300, 0, SCENE_H);
  sea.addColorStop(0, pal.seaTop); sea.addColorStop(1, pal.seaBottom);
  ctx.fillStyle = sea; ctx.fillRect(0, 300, SCENE_W, SCENE_H - 300);

  // Stars (night only) — drawn from the seeded stream, same on both panels.
  if (pal.star) {
    ctx.fillStyle = pal.star;
    for (let i = 0; i < 46; i++) {
      const sx = rng.range(6, SCENE_W - 6), sy = rng.range(6, 210);
      ctx.globalAlpha = rng.range(0.35, 1);
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.globalAlpha = 1;
  }

  // Sun / moon.
  ctx.fillStyle = v.sunAlt ? pal.sunAlt : pal.sun;
  ctx.beginPath(); ctx.arc(92, 78, 30, 0, Math.PI * 2); ctx.fill();
  if (pal.star) { // moon shadow bite
    ctx.fillStyle = pal.skyTop;
    ctx.beginPath(); ctx.arc(106, 68, 24, 0, Math.PI * 2); ctx.fill();
  }

  // Clouds and gulls.
  cloud(ctx, 150, 58, 1.0, 'rgba(255,255,255,0.92)');
  if (!v.cloudGone) cloud(ctx, 330, 64, 0.85, 'rgba(255,255,255,0.88)');
  cloud(ctx, 468, 42, 0.7, 'rgba(255,255,255,0.85)');
  const gullColour = pal.star ? '#aebfd6' : '#33566b';
  bird(ctx, 208, 118, 1, gullColour);
  bird(ctx, 256, 102, 0.8, gullColour);
  if (!v.birdGone) bird(ctx, 302, 126, 0.9, gullColour);

  // Distant hills and the shore strip.
  ctx.fillStyle = pal.hill;
  ctx.beginPath();
  ctx.moveTo(0, 300); ctx.quadraticCurveTo(120, 252, 260, 292);
  ctx.quadraticCurveTo(380, 318, SCENE_W, 282); ctx.lineTo(SCENE_W, 302); ctx.lineTo(0, 302);
  ctx.fill();
  ctx.fillStyle = pal.shore; ctx.fillRect(0, 296, SCENE_W, 10);

  drawHouses(ctx, pal, v);
  drawLighthouse(ctx, pal, v);
  drawBoats(ctx, pal, v);

  // Buoy (drifts right when the difference is on).
  const bx = v.buoyDrift ? 122 : 62;
  ctx.fillStyle = '#d64541';
  ctx.beginPath(); ctx.moveTo(bx - 10, 424); ctx.lineTo(bx + 10, 424); ctx.lineTo(bx + 5, 442); ctx.lineTo(bx - 5, 442); ctx.fill();
  ctx.fillStyle = '#f7f3e3'; ctx.fillRect(bx - 10, 430, 20, 4);
  ctx.strokeStyle = '#7a2d2a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(bx, 424); ctx.lineTo(bx, 412); ctx.stroke();
  ctx.fillStyle = '#ffd94d'; ctx.beginPath(); ctx.arc(bx, 410, 3.4, 0, Math.PI * 2); ctx.fill();

  // Leaping fish (only in the changed picture).
  if (v.fishLeap) {
    ctx.strokeStyle = '#cfe8f5'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(255, 424, 17, Math.PI * 1.15, Math.PI * 1.75); ctx.stroke();
    ctx.fillStyle = '#9fd3e8';
    ctx.beginPath(); ctx.ellipse(255, 404, 13, 6, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8f6fb'; ctx.beginPath(); ctx.ellipse(252, 402, 6, 3, -0.5, 0, Math.PI * 2); ctx.fill();
  }

  // Wave strokes across the sea — seeded, identical on both panels.
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const wx = rng.range(8, SCENE_W - 30), wy = rng.range(318, SCENE_H - 12), wl = rng.range(12, 26);
    ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + wl, wy); ctx.stroke();
  }
}

function drawHouses(ctx, pal, v) {
  const roofs = ['#b5542c', '#7a4a8c', '#3f7d5d'];
  const walls = ['#f2e3c1', '#e8d8e8', '#dcebd2'];
  for (let i = 0; i < 3; i++) {
    const hx = 56 + i * 108, hy = 252;
    ctx.fillStyle = walls[i]; ctx.fillRect(hx, hy, 84, 48);
    ctx.fillStyle = (i === 0 && v.roofAlt) ? pal.roofAlt : roofs[i];
    ctx.beginPath();
    ctx.moveTo(hx - 6, hy); ctx.lineTo(hx + 42, hy - 27); ctx.lineTo(hx + 90, hy); ctx.fill();
    ctx.fillStyle = '#6b4a2f'; ctx.fillRect(hx + 36, hy + 24, 13, 24); // door
    for (let w = 0; w < 2; w++) {
      const wx = hx + 13 + w * 39, wy = hy + 12;
      const lit = pal.star || (i === 2 && w === 1 && v.lampLit);
      ctx.fillStyle = lit ? pal.lampGlow : '#33566b';
      ctx.fillRect(wx, wy, 14, 16);
      ctx.strokeStyle = '#5d4630'; ctx.lineWidth = 1.6; ctx.strokeRect(wx, wy, 14, 16);
    }
  }
}

function drawLighthouse(ctx, pal, v) {
  // Rocky point.
  ctx.fillStyle = '#5d5648';
  ctx.beginPath();
  ctx.moveTo(448, 302); ctx.lineTo(474, 268); ctx.lineTo(540, 268); ctx.lineTo(556, 302); ctx.fill();
  // Tower (trapezoid) with stripes.
  const stripe = v.stripeAlt ? pal.stripeAlt : pal.stripe;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(478, 272); ctx.lineTo(486, 158); ctx.lineTo(518, 158); ctx.lineTo(526, 272); ctx.fill();
  ctx.clip();
  ctx.fillStyle = '#f4efe2'; ctx.fillRect(470, 150, 64, 124);
  ctx.fillStyle = stripe;
  for (const sy of [182, 216, 250]) ctx.fillRect(470, sy, 64, 15);
  ctx.restore();
  ctx.strokeStyle = 'rgba(40,40,50,0.35)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(478, 272); ctx.lineTo(486, 158); ctx.lineTo(518, 158); ctx.lineTo(526, 272); ctx.stroke();
  // Lamp room and beam.
  ctx.fillStyle = '#2f3b4c'; ctx.fillRect(484, 140, 36, 10);
  ctx.fillStyle = pal.lampGlow; ctx.fillRect(490, 124, 24, 17);
  ctx.strokeStyle = '#2f3b4c'; ctx.strokeRect(490, 124, 24, 17);
  ctx.fillStyle = '#2f3b4c';
  ctx.beginPath(); ctx.moveTo(486, 124); ctx.lineTo(518, 124); ctx.lineTo(502, 110); ctx.fill();
  if (pal.star && !v.beamOut) {
    ctx.fillStyle = pal.beam;
    ctx.beginPath();
    ctx.moveTo(492, 132); ctx.lineTo(330, 96); ctx.lineTo(330, 176); ctx.fill();
  }
  // Flag on the pole — flips direction with the difference.
  ctx.strokeStyle = '#2f3b4c'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(502, 110); ctx.lineTo(502, 92); ctx.stroke();
  ctx.fillStyle = '#d64541';
  ctx.beginPath();
  if (v.flagFlip) { ctx.moveTo(502, 92); ctx.lineTo(480, 98); ctx.lineTo(502, 104); }
  else { ctx.moveTo(502, 92); ctx.lineTo(524, 98); ctx.lineTo(502, 104); }
  ctx.fill();
}

function drawBoats(ctx, pal, v) {
  // Sailboat.
  ctx.strokeStyle = '#5d4630'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(152, 366); ctx.lineTo(152, 296); ctx.stroke();
  ctx.fillStyle = v.sailAlt ? pal.sailAlt : '#f7f3e3';
  ctx.beginPath(); ctx.moveTo(156, 300); ctx.lineTo(156, 356); ctx.lineTo(196, 356); ctx.fill();
  ctx.fillStyle = pal.star ? '#d8dee9' : '#ffffff';
  ctx.beginPath(); ctx.moveTo(148, 306); ctx.lineTo(148, 356); ctx.lineTo(118, 356); ctx.fill();
  ctx.fillStyle = '#8a5a33';
  ctx.beginPath(); ctx.moveTo(112, 366); ctx.lineTo(198, 366); ctx.lineTo(184, 384); ctx.lineTo(124, 384); ctx.fill();
  // Fishing boat with cabin.
  ctx.fillStyle = '#38618c';
  ctx.beginPath(); ctx.moveTo(316, 402); ctx.lineTo(404, 402); ctx.lineTo(390, 422); ctx.lineTo(328, 422); ctx.fill();
  ctx.fillStyle = '#f2e3c1'; ctx.fillRect(340, 380, 34, 22);
  ctx.fillStyle = '#33566b'; ctx.fillRect(346, 385, 10, 10); ctx.fillRect(360, 385, 10, 10);
  ctx.fillStyle = '#b5542c'; ctx.fillRect(336, 374, 42, 6);
  // Wooden pier and crates.
  ctx.fillStyle = '#8a6a42'; ctx.fillRect(392, 452, 168, 9);
  ctx.fillRect(404, 461, 8, 26); ctx.fillRect(472, 461, 8, 26); ctx.fillRect(536, 461, 8, 26);
  ctx.fillStyle = '#a97c50'; ctx.fillRect(512, 428, 24, 24); ctx.fillRect(522, 406, 22, 22);
  ctx.strokeStyle = '#6e5230'; ctx.lineWidth = 1.6;
  ctx.strokeRect(512, 428, 24, 24); ctx.strokeRect(522, 406, 22, 22);
  // Rowboat (gone in the changed picture).
  if (!v.boatGone) {
    ctx.fillStyle = '#7a9e43';
    ctx.beginPath(); ctx.moveTo(424, 446); ctx.lineTo(490, 446); ctx.lineTo(478, 460); ctx.lineTo(436, 460); ctx.fill();
    ctx.strokeStyle = '#5d4630'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(448, 444); ctx.lineTo(470, 428); ctx.stroke();
  }
}
