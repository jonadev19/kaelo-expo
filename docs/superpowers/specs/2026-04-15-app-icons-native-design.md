---
title: App Icons — Native Integration (iOS & Android)
date: 2026-04-15
status: approved
---

## Overview

Place the pre-made app icons in `assets/AppIcons/` into the native iOS and Android directories. This is a bare workflow project, so icons are managed directly in the native layer.

## Approach

Direct file replacement in native directories (no `expo prebuild`, no icon generation tools). The user has already prepared correctly-sized assets.

## iOS

**Source:** `assets/AppIcons/Assets.xcassets/AppIcon.appiconset/`
**Destination:** `ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/`

Files to copy:
- All 11 PNG files: `29.png`, `40.png`, `57.png`, `58.png`, `60.png`, `80.png`, `87.png`, `114.png`, `120.png`, `180.png`, `1024.png`
- `Contents.json` — replaces the current single-entry Expo default

The current `Contents.json` only references `App-Icon-1024x1024@1x.png`. The new one contains all iPhone sizes plus ios-marketing (1024px).

The old `App-Icon-1024x1024@1x.png` is removed.

## Android

**Source:** `assets/AppIcons/android/mipmap-{density}/ic_launcher.png`
**Destination:** `android/app/src/main/res/mipmap-{density}/`

Density mapping (dimensions already correct):
| Density | Size |
|---|---|
| mipmap-mdpi | 48×48 |
| mipmap-hdpi | 72×72 |
| mipmap-xhdpi | 96×96 |
| mipmap-xxhdpi | 144×144 |
| mipmap-xxxhdpi | 192×192 |

For each density directory, copy `ic_launcher.png` and also create copies named `ic_launcher_foreground.png` and `ic_launcher_round.png` (same image, different names to satisfy adaptive icon references).

The existing `.webp` files (`ic_launcher.webp`, `ic_launcher_foreground.webp`, `ic_launcher_round.webp`) are deleted from each directory.

The `mipmap-anydpi-v26/ic_launcher.xml` and `ic_launcher_round.xml` are **not modified** — they already reference `@mipmap/ic_launcher_foreground` which will resolve to the new PNG.

**Result:** API < 26 uses flat icon directly. API 26+ adaptive icon shows the full flat icon (background included) as the foreground layer — visually matches the intended design.

## app.json

No changes needed. The `icon` and `adaptiveIcon` fields in `app.json` are unused at build time in bare workflow (native directories take precedence).

## Out of Scope

- Splash screen icons
- Web favicon
- No conversion of PNGs to WebP
