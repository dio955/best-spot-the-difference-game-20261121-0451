// Twin Harbor — seeded random helpers.
// Both harbour panels must be drawn from the exact same random stream, so the
// scene builder re-seeds this generator per panel and only the deliberate
// differences (the variant flags) ever change what is drawn.

function makeRng(seed) {
  let state = (seed >>> 0) || 1;
  // mulberry32: tiny, fast, deterministic.
  function next() {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next,
    range(lo, hi) { return lo + next() * (hi - lo); },
    int(lo, hi) { return Math.floor(lo + next() * (hi - lo + 1)); },
    pick(list) { return list[Math.floor(next() * list.length)]; },
  };
}

// A stable shuffle so a level's seven differences come out of the catalogue in
// a seeded order (which ones are "still unfound" in a screenshot varies).
function shuffled(rng, list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
  }
  return out;
}
