# Splash Screen — Design Spec

**Date:** 2026-04-15
**Status:** Approved

## Overview

Basic native splash screen for Kaelo using the brand app icon on a dark emerald background. No custom code — configured entirely via `app.json`.

## Design

- **Image:** `./assets/AppIcons/appstore.png` (1024×1024 brand icon)
- **Resize mode:** `contain` (centered, proportional, no cropping)
- **Background color:** `#064E3B` (brand `primary-900`, dark emerald)

## Changes

Single file: `app.json`

```json
"splash": {
  "image": "./assets/AppIcons/appstore.png",
  "resizeMode": "contain",
  "backgroundColor": "#064E3B"
}
```

## Rationale

- Native splash renders before JS loads — no JS-based splash can achieve this
- `primary-900` (#064E3B) is on-brand and provides strong contrast for the icon
- `contain` is safe regardless of icon background color
