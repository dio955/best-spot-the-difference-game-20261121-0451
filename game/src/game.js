// Twin Harbor — Spot the Difference: the game itself.
// Two harbour pictures side by side; the right one hides seven differences.
// Click a difference in either picture to ring it on both. Three wrong clicks
// (or an empty clock) ends the level; hints are limited and cost stars.

const PANEL_Y = 92;
const PANEL_H = SCENE_H;
const LEFT_X = 24;
const RIGHT_X = 632;
const LEVEL_SECONDS = 240;

const LEVELS = [
  { name: 'Morning Harbour', palette: 'day', seed: 1103, radius: 1.0,
    diffs: ['cloud-gone', 'sail-hue', 'bird-gone', 'lamp-lit', 'flag-flip', 'stripe-hue', 'roof-hue'] },
  { name: 'Sunset Harbour', palette: 'sunset', seed: 4701, radius: 0.88,
    diffs: ['sun-hue', 'buoy-drift', 'boat-gone', 'sail-hue', 'cloud-gone', 'lamp-lit', 'fish-leap'] },
  { name: 'Night Harbour', palette: 'night', seed: 9307, radius: 0.78,
    diffs: ['beam-out', 'stripe-hue', 'flag-flip', 'buoy-drift', 'boat-gone', 'roof-hue', 'lamp-lit'] },
];

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

const state = {
  screen: 'play', // play | levelclear | gameclear | failed
  level: 0,
  found: new Set(),
  mistakes: 0,
  hintsLeft: 2,
  hintsUsed: 0,
  secondsLeft: LEVEL_SECONDS,
  stars: [0, 0, 0],
  hintId: null,
  hintUntil: 0,
  shakeUntil: 0,
  lastTick: 0,
  frozen: false, // screenshot modes freeze the clock
};

const HINT_BUTTON = { x: 1052, y: 632, w: 140, h: 38 };
const AGAIN_BUTTON = { x: 508, y: 470, w: 200, h: 48 };

function levelDef() { return LEVELS[state.level]; }
function remaining() { return levelDef().diffs.length - state.found.size; }

function startLevel(i) {
  state.level = i;
  state.found = new Set();
  state.mistakes = 0;
  state.hintsLeft = 2;
  state.hintsUsed = 0;
  state.secondsLeft = LEVEL_SECONDS;
  state.hintId = null;
  state.screen = 'play';
}

function starsForLevel() {
  if (state.mistakes === 0 && state.hintsUsed === 0) return 3;
  if (state.mistakes + state.hintsUsed <= 2) return 2;
  return 1;
}

// ---- drawing ---------------------------------------------------------------

function drawPanel(ox, variant) {
  ctx.save();
  ctx.translate(ox, PANEL_Y);
  ctx.beginPath(); ctx.rect(0, 0, SCENE_W, SCENE_H); ctx.clip();
  drawScene(ctx, PALETTES[levelDef().palette], variant, levelDef().seed);
  ctx.restore();
  ctx.strokeStyle = '#e8e3d3'; ctx.lineWidth = 3;
  ctx.strokeRect(ox, PANEL_Y, SCENE_W, SCENE_H);
}

function drawMarker(ox, d, colour, width) {
  ctx.strokeStyle = colour; ctx.lineWidth = width;
  ctx.beginPath(); ctx.arc(ox + d.x, PANEL_Y + d.y, d.r + 7, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(ox + d.x, PANEL_Y + d.y, d.r + 11, 0, Math.PI * 2); ctx.stroke();
}

function drawStar(cx, cy, r, filled) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const px = cx + Math.cos(a) * rad, py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = filled ? '#ffd94d' : 'rgba(255,255,255,0.18)';
  ctx.fill();
  ctx.strokeStyle = '#0d1b2a'; ctx.lineWidth = 1.4; ctx.stroke();
}

function drawHud() {
  ctx.fillStyle = '#e8e3d3';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('Twin Harbor', 24, 34);
  ctx.font = 'italic 19px Georgia, serif';
  ctx.fillStyle = '#9db4c0';
  ctx.fillText('Spot the Difference — ' + levelDef().name, 24, 66);

  ctx.textAlign = 'center';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillStyle = remaining() === 0 ? '#8be08b' : '#ffd94d';
  ctx.fillText(remaining() + ' of ' + levelDef().diffs.length + ' differences remain', 608, 40);

  // Clock.
  const mm = Math.floor(state.secondsLeft / 60);
  const ss = String(Math.floor(state.secondsLeft % 60)).padStart(2, '0');
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillStyle = state.secondsLeft <= 30 ? '#ff7b6b' : '#e8e3d3';
  ctx.fillText('⏱ ' + mm + ':' + ss, 608, 70);

  // Level stars earned so far + mistakes as crosses.
  ctx.textAlign = 'right';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillStyle = '#e8e3d3';
  ctx.fillText('Level ' + (state.level + 1) + ' of ' + LEVELS.length, 1192, 34);
  for (let i = 0; i < 3; i++) drawStar(1112 + i * 34, 66, 13, state.stars[i] > 0 || (i === 0 && state.level > 0));
  ctx.fillStyle = '#ff7b6b'; ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText('✕'.repeat(state.mistakes) + '·'.repeat(3 - state.mistakes), 1192, 66);

  // Hint button.
  ctx.fillStyle = state.hintsLeft > 0 ? '#2470c7' : '#3a4a5a';
  ctx.beginPath(); ctx.roundRect(HINT_BUTTON.x, HINT_BUTTON.y, HINT_BUTTON.w, HINT_BUTTON.h, 8); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText('Hint (' + state.hintsLeft + ')', HINT_BUTTON.x + HINT_BUTTON.w / 2, HINT_BUTTON.y + 20);
  ctx.textAlign = 'left'; ctx.fillStyle = '#9db4c0'; ctx.font = 'italic 17px Georgia, serif';
  ctx.fillText('Found differences ring on both pictures. Three misses — or an empty clock — ends the level.', 24, 652);
}

function drawOverlay(title, lines, buttonLabel) {
  ctx.fillStyle = 'rgba(8, 20, 32, 0.78)';
  ctx.fillRect(LEFT_X, PANEL_Y, RIGHT_X + SCENE_W - LEFT_X, PANEL_H);
  ctx.textAlign = 'center'; ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText(title, 608, 300);
  ctx.fillStyle = '#e8e3d3'; ctx.font = '22px Georgia, serif';
  lines.forEach((line, i) => ctx.fillText(line, 608, 348 + i * 32));
  if (state.screen === 'levelclear' || state.screen === 'gameclear') {
    const total = state.screen === 'gameclear'
      ? state.stars.reduce((a, b) => a + b, 0)
      : starsForLevel();
    const max = state.screen === 'gameclear' ? 9 : 3;
    for (let i = 0; i < 3; i++) {
      const frac = total / max;
      drawStar(560 + i * 48, 348 + lines.length * 32 + 26, 19, frac * 3 > i);
    }
  }
  ctx.fillStyle = '#2470c7';
  ctx.beginPath(); ctx.roundRect(AGAIN_BUTTON.x, AGAIN_BUTTON.y, AGAIN_BUTTON.w, AGAIN_BUTTON.h, 10); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 21px Georgia, serif';
  ctx.fillText(buttonLabel, 608, AGAIN_BUTTON.y + 25);
  ctx.textAlign = 'left';
}

function draw(now) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const def = levelDef();
  drawPanel(LEFT_X, baseVariant());
  drawPanel(RIGHT_X, variantWith(def.diffs));
  // Found markers ring on both panels.
  for (const id of state.found) {
    const d = DIFFERENCES[id];
    drawMarker(LEFT_X, d, '#37d67a', 4);
    drawMarker(RIGHT_X, d, '#37d67a', 4);
  }
  // Hint pulse.
  if (state.hintId && now < state.hintUntil) {
    const d = DIFFERENCES[state.hintId];
    drawMarker(LEFT_X, d, '#ffd94d', 3.4);
    drawMarker(RIGHT_X, d, '#ffd94d', 3.4);
  }
  drawHud();
  if (state.screen === 'levelclear') {
    drawOverlay('Harbour cleared!', [
      'You found all ' + def.diffs.length + ' differences in ' + def.name + '.',
      state.level + 1 < LEVELS.length ? 'The next harbour is waiting…' : '',
    ], state.level + 1 < LEVELS.length ? 'Next level ▸' : 'Finish ▸');
  } else if (state.screen === 'gameclear') {
    drawOverlay('Twin Harbor complete!', [
      'All three harbours, every difference found.',
      'Thanks for playing — the gulls salute you.',
    ], 'Play again');
  } else if (state.screen === 'failed') {
    drawOverlay('The tide came in…', [
      state.mistakes >= 3 ? 'Three wrong clicks ended the level.' : 'The clock ran out on this harbour.',
      'The differences are still out there.',
    ], 'Try again');
  }
}

// ---- input -----------------------------------------------------------------

function panelPoint(evt) {
  const rect = canvas.getBoundingClientRect();
  const x = (evt.clientX - rect.left) * (canvas.width / rect.width);
  const y = (evt.clientY - rect.top) * (canvas.height / rect.height);
  for (const ox of [LEFT_X, RIGHT_X]) {
    if (x >= ox && x <= ox + SCENE_W && y >= PANEL_Y && y <= PANEL_Y + SCENE_H) {
      return { x: x - ox, y: y - PANEL_Y };
    }
  }
  return null;
}

function inRect(x, y, r) {
  const rect = canvas.getBoundingClientRect();
  const cx = (event.clientX - rect.left) * (canvas.width / rect.width);
  const cy = (event.clientY - rect.top) * (canvas.height / rect.height);
  return cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h;
}

function useHint() {
  if (state.screen !== 'play' || state.hintsLeft <= 0) return;
  const unfound = levelDef().diffs.filter((id) => !state.found.has(id));
  if (!unfound.length) return;
  state.hintsLeft -= 1;
  state.hintsUsed += 1;
  state.hintId = unfound[Math.floor(Math.random() * unfound.length)];
  state.hintUntil = performance.now() + 1600;
  HarborAudio.hint();
}

canvas.addEventListener('click', (evt) => {
  HarborAudio.unlock();
  if (state.screen !== 'play') {
    if (inRect(0, 0, AGAIN_BUTTON)) {
      if (state.screen === 'levelclear') {
        state.stars[state.level] = starsForLevel();
        if (state.level + 1 < LEVELS.length) startLevel(state.level + 1);
        else state.screen = 'gameclear';
      } else if (state.screen === 'gameclear') {
        state.stars = [0, 0, 0]; startLevel(0);
      } else if (state.screen === 'failed') {
        startLevel(state.level);
      }
    }
    return;
  }
  if (inRect(0, 0, HINT_BUTTON)) { useHint(); return; }
  const p = panelPoint(evt);
  if (!p) return;
  const def = levelDef();
  for (const id of def.diffs) {
    if (state.found.has(id)) continue;
    const d = DIFFERENCES[id];
    const rr = d.r * def.radius + 8;
    if ((p.x - d.x) ** 2 + (p.y - d.y) ** 2 <= rr * rr) {
      state.found.add(id);
      HarborAudio.found();
      if (state.found.size === def.diffs.length) {
        state.stars[state.level] = starsForLevel();
        state.screen = 'levelclear';
        HarborAudio.levelClear();
      }
      return;
    }
  }
  state.mistakes += 1;
  state.shakeUntil = performance.now() + 250;
  HarborAudio.wrong();
  if (state.mistakes >= 3) { state.screen = 'failed'; HarborAudio.fail(); }
});

window.addEventListener('keydown', (evt) => {
  if (evt.key === 'h' || evt.key === 'H') useHint();
  if (evt.key === 'r' || evt.key === 'R') startLevel(state.level);
});

// ---- main loop ---------------------------------------------------------------

function frame(now) {
  if (!state.frozen && state.screen === 'play' && state.lastTick) {
    state.secondsLeft -= (now - state.lastTick) / 1000;
    if (state.secondsLeft <= 0) {
      state.secondsLeft = 0;
      state.screen = 'failed';
      HarborAudio.fail();
    }
  }
  state.lastTick = now;
  draw(now);
  requestAnimationFrame(frame);
}

// ---- screenshot / demo modes -------------------------------------------------
// ?shot=play1|play2|play3|win freezes a representative mid-game state so the
// maker's screenshots are real renders of the game itself.

function applyShotMode() {
  const shot = new URLSearchParams(location.search).get('shot');
  if (!shot) return false;
  state.frozen = true;
  if (shot === 'play1') {
    startLevel(0);
    for (const id of ['cloud-gone', 'sail-hue', 'flag-flip']) state.found.add(id);
    state.secondsLeft = 183;
  } else if (shot === 'play2') {
    startLevel(1);
    for (const id of ['sun-hue', 'boat-gone']) state.found.add(id);
    state.mistakes = 1;
    state.secondsLeft = 141;
    state.hintId = 'buoy-drift';
    state.hintUntil = Number.MAX_SAFE_INTEGER;
  } else if (shot === 'play3') {
    startLevel(2);
    for (const id of ['beam-out', 'stripe-hue', 'flag-flip', 'buoy-drift', 'boat-gone']) state.found.add(id);
    state.secondsLeft = 96;
  } else if (shot === 'win') {
    startLevel(2);
    for (const id of LEVELS[2].diffs) state.found.add(id);
    state.stars = [3, 2, 3];
    state.screen = 'gameclear';
  }
  return true;
}

applyShotMode();
requestAnimationFrame(frame);
requestAnimationFrame(() => { window.__shotReady = true; });
