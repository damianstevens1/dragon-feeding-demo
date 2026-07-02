# Dragon Feeding Game for iOS

This folder contains a native iPhone Xcode project that wraps the existing Dragon Feeding Game in a `WKWebView`.

The app is intentionally simple:

- Swift + UIKit + WebKit
- Portrait iPhone app
- No login
- No ads
- No tracking
- No network requirement for game content
- The existing web game is built and copied into the app bundle during Xcode builds

## Open In Xcode

Install full Xcode 26 or newer from Apple, then open:

```bash
open ios/DragonFeedingGame.xcodeproj
```

You can also run:

```bash
pnpm ios:open
```

## Before Archiving

In Xcode:

1. Select the `DragonFeedingGame` project.
2. Select the `DragonFeedingGame` target.
3. Go to **Signing & Capabilities**.
4. Choose your Apple Developer team.
5. Confirm the Bundle Identifier.

Current bundle identifier:

```text
com.damianstevens.dragonfeeding
```

Change it if your Apple Developer account needs a different identifier.

## Build Behavior

The Xcode target has a build phase named:

```text
Build and Bundle Web Game
```

That phase runs:

```bash
pnpm install --frozen-lockfile
pnpm build
```

Then it copies `dist/` into the app bundle as `www/`.

This means Xcode needs Node.js and `pnpm` available on the Mac that archives the app.

As of July 2026, Apple requires iOS apps uploaded to App Store Connect to be built with the iOS/iPadOS 26 SDK or later. The app's deployment target can still be lower, but the archive should be made with Xcode 26 or newer.

## Archive And Upload

After signing is set:

1. In Xcode, choose **Any iOS Device** or a connected iPhone.
2. Choose **Product > Archive**.
3. When Organizer opens, choose **Distribute App**.
4. Choose **App Store Connect**.
5. Upload the archive.

After upload processing finishes, finish the listing in App Store Connect.

## App Store Price

The app price is not set inside Xcode. Set it in App Store Connect under **Pricing and Availability** and choose the free price option.
