# Twin Harbor — Spot the Difference

[![Twin Harbor on make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/dio955/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/dio955/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

An original spot-the-difference game, entered in the make.fun bounty
[Make the best spot the difference game](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).

Two harbour pictures side by side — Morning, Sunset and Night — and the right
one always hides seven differences: a vanished cloud, a drifted buoy, a sail
that changed colour, a lighthouse beam gone dark. Click a difference in
either picture to ring it on both. Three wrong clicks, or an empty clock,
ends the level; two hints per level point at a difference but cost stars.
Find all seven to clear the harbour and earn up to three stars per level.

Everything is drawn in code on a canvas — no image files, no network, no
build step. All sounds are synthesised WebAudio blips.

## Play

Serve the folder statically and open `game/index.html` in a desktop browser,
or just open the file. Mouse to click, `H` for a hint, `R` to restart a level.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json` with the vendored library.
- `game/index.html` — the page and its styling.
- `game/src/scene.js` — the harbour painter and the difference catalogue.
- `game/src/game.js` — game state, input, HUD, levels and demo modes.
- `game/src/rng.js` — the seeded random generator both panels share.
- `game/src/audio.js` — the WebAudio blips.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `screenshots/` — real renders of the game, taken by its maker.

## License

MIT — see `LICENSE`.
