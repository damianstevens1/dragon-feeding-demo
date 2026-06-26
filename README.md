# Dragon Feeding Flashcard Demo

Toddler-friendly object-function flashcard game with a dragon feeding mechanic, reward videos, background music, sound effects, and a final dragon reward video/dance.

## Run Locally

```bash
pnpm install
pnpm dev
```

Then open the local Vite URL shown in the terminal.

## Build

```bash
pnpm build
```

The production build outputs to `dist/`.

## Main Files

- `src/main.js` - game logic, audio, reward-video flow, dragon animation states
- `src/styles.css` - layout, tray, question modal, reward video UI
- `public/assets/` - images, audio prompts, reward videos, dragon frames, sprites
- `public/audio/` - background music and extra sound effects
- `scripts/` - helper scripts used while building assets

## Notes

The final reward video is stored at:

```text
public/assets/videos/final-dragon-reward.mp4
```

It has been converted to H.264/AAC MP4 for browser and iPhone compatibility.
