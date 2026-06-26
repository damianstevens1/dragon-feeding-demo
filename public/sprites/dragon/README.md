Dragon sprite replacement folder.

The code exposes these animation states through `data-sprite-state` on `#dragon-puppet`:

- idle
- blink
- happy-bounce
- eat-crunch
- funky-dance
- fire-breath

Expected final sprite files:

- idle.png
- blink.png
- happy-bounce.png
- eat-crunch.png
- funky-dance.png
- fire-breath.png

Current placeholder sheets are generated from the existing dragon frame art. Each sheet is 1776x444 with 4 horizontal frames at 444x444 each.

Preview the current sheets at:

`/sprites/dragon/preview.html`

Until final art is added, the app falls back to the existing `public/assets/dragon-frames` images plus CSS and Three.js effects.
