# Kibarashka: Yuzu Rush

A platformer about a capybara that collects yuzu and carries them on its head.

You pick up yuzu -> they land on your head and stack into a tower. If something hits you the tower falls apart and you have to grab them back quickly.
There is an onsen at the end of each level, the more yuzu you bring the better. 6 levels in total.

## Running

```
npm install
npm run dev
```

and then open http://localhost:5173

Build: `npm run build` (goes to `dist/`).

## Controls

- arrows or A/D - move
- space / W / up arrow / Z - jump (hold longer = jump higher)
- down arrow or S in the air - PLOP
- R - restart level
- ESC or P - pause
- M - mute

Gamepad works too (A jump, B plop, Y restart, start pause). Only tested with an xbox pad.

## Stars

1. finish the level
2. bring 80% of the yuzu
3. find 3 ducklings

## Debug

`?level=3` starts level 3 right away, `?debug=1` shows hitboxes and fps (N - next level, K - jump to checkpoint), `?mute=1` no sound.

`npm run lint:levels` checks if the level maps are ok (row lengths, if there is a start, an onsen etc).

`npm test` - playwright tests, checks if every level starts (takes a while because it does a build first).

## Tech

TypeScript + Phaser 3 + Vite. Graphics are SVG generated in code, sounds from Web Audio, font is Fredoka (OFL).
