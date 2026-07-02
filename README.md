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

## iPhone App Store Build

This repo now includes an Xcode iPhone app wrapper:

```text
ios/DragonFeedingGame.xcodeproj
```

Open it with:

```bash
pnpm ios:open
```

The Xcode app builds this Vite game and bundles the output locally inside the iPhone app. App Store Connect notes, free pricing guidance, privacy answers, and review notes are in:

```text
app-store/
```

Full Xcode 26 or newer is required to archive and upload to App Store Connect.

## Main Files

- `src/main.js` - game logic, audio, reward-video flow, dragon animation states
- `src/styles.css` - layout, tray, question modal, reward video UI
- `public/assets/` - images, audio prompts, reward videos, dragon frames, sprites
- `public/audio/` - background music and extra sound effects
- `scripts/` - helper scripts used while building assets
- `ios/` - native Swift/WebKit iPhone wrapper for Xcode and App Store submission
- `app-store/` - App Store Connect metadata, privacy, pricing, and review notes

## Notes

The final reward video is stored at:

```text
public/assets/videos/final-dragon-reward.mp4
```

It has been converted to H.264/AAC MP4 for browser and iPhone compatibility.
