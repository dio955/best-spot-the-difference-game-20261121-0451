// Twin Harbor — tiny WebAudio blips, all synthesised, no audio files.
// The context is created lazily on the first user gesture (browser policy).

const HarborAudio = (() => {
  let ctx = null;
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, at, dur, type, gain) {
    const c = ensure(); if (!c) return;
    const t0 = c.currentTime + at;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.12, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  return {
    unlock() { ensure(); },
    found() { tone(660, 0, 0.12, 'sine', 0.12); tone(880, 0.07, 0.14, 'sine', 0.12); tone(1320, 0.14, 0.2, 'sine', 0.1); },
    wrong() { tone(150, 0, 0.22, 'sawtooth', 0.07); tone(110, 0.05, 0.24, 'sawtooth', 0.06); },
    hint() { tone(520, 0, 0.1, 'triangle', 0.09); tone(520, 0.16, 0.1, 'triangle', 0.09); },
    levelClear() { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.22, 'triangle', 0.11)); },
    gameClear() { [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.12, 0.26, 'triangle', 0.11)); },
    fail() { [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.13, 0.24, 'triangle', 0.09)); },
  };
})();
