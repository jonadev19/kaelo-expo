# App Icons Native Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder Expo icons in the native iOS and Android directories with the pre-made brand icons from `assets/AppIcons/`.

**Architecture:** Direct file replacement in native directories. No code changes — only asset files are touched. iOS receives a full appiconset (11 PNGs + Contents.json). Android receives flat PNGs (replacing WebP files) for all 5 density buckets, duplicated under the three expected names (ic_launcher, ic_launcher_foreground, ic_launcher_round).

**Tech Stack:** Bash (cp, rm), iOS Xcode asset catalog, Android mipmap resource system.

---

### Task 1: Replace iOS AppIcon appiconset

**Files:**
- Modify: `ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/` (replace all contents)

- [ ] **Step 1: Remove the existing Expo placeholder icon**

```bash
rm ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png
```

- [ ] **Step 2: Copy all PNG icons from assets**

```bash
cp assets/AppIcons/Assets.xcassets/AppIcon.appiconset/29.png   ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/29.png
cp assets/AppIcons/Assets.xcassets/AppIcon.appiconset/40.png   ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/40.png
cp assets/AppIcons/Assets.xcassets/AppIcon.appiconset/57.png   ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/57.png
cp assets/AppIcons/Assets.xcassets/AppIcon.appiconset/58.png   ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/58.png
cp assets/AppIcons/Assets.xcassets/AppIcon.appiconset/60.png   ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/60.png
cp assets/AppIcons/Assets.xcassets/AppIcon.appiconset/80.png   ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/80.png
cp assets/AppIcons/Assets.xcassets/AppIcon.appiconset/87.png   ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/87.png
cp assets/AppIcons/Assets.xcassets/AppIcon.appiconset/114.png  ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/114.png
cp assets/AppIcons/Assets.xcassets/AppIcon.appiconset/120.png  ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/120.png
cp assets/AppIcons/Assets.xcassets/AppIcon.appiconset/180.png  ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/180.png
cp assets/AppIcons/Assets.xcassets/AppIcon.appiconset/1024.png ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/1024.png
```

- [ ] **Step 3: Replace Contents.json**

```bash
cp assets/AppIcons/Assets.xcassets/AppIcon.appiconset/Contents.json \
   ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/Contents.json
```

- [ ] **Step 4: Verify the appiconset has the correct files**

```bash
ls ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/
```

Expected output — exactly these 12 files, no `App-Icon-1024x1024@1x.png`:
```
1024.png  114.png  120.png  180.png  29.png  40.png  57.png  58.png  60.png  80.png  87.png  Contents.json
```

- [ ] **Step 5: Commit**

```bash
git add ios/kaeloappproduction/Images.xcassets/AppIcon.appiconset/
git commit -m "feat(ios): replace app icon with brand assets"
```

---

### Task 2: Replace Android mipmap-mdpi icons

**Files:**
- Modify: `android/app/src/main/res/mipmap-mdpi/` (48×48)

- [ ] **Step 1: Remove existing WebP files**

```bash
rm android/app/src/main/res/mipmap-mdpi/ic_launcher.webp
rm android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.webp
rm android/app/src/main/res/mipmap-mdpi/ic_launcher_round.webp
```

- [ ] **Step 2: Copy PNG icon under all three required names**

```bash
cp assets/AppIcons/android/mipmap-mdpi/ic_launcher.png android/app/src/main/res/mipmap-mdpi/ic_launcher.png
cp assets/AppIcons/android/mipmap-mdpi/ic_launcher.png android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png
cp assets/AppIcons/android/mipmap-mdpi/ic_launcher.png android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
```

- [ ] **Step 3: Verify**

```bash
ls android/app/src/main/res/mipmap-mdpi/
```

Expected (no `.webp` files):
```
ic_launcher.png  ic_launcher_foreground.png  ic_launcher_round.png
```

---

### Task 3: Replace Android mipmap-hdpi icons

**Files:**
- Modify: `android/app/src/main/res/mipmap-hdpi/` (72×72)

- [ ] **Step 1: Remove existing WebP files**

```bash
rm android/app/src/main/res/mipmap-hdpi/ic_launcher.webp
rm android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.webp
rm android/app/src/main/res/mipmap-hdpi/ic_launcher_round.webp
```

- [ ] **Step 2: Copy PNG icon under all three required names**

```bash
cp assets/AppIcons/android/mipmap-hdpi/ic_launcher.png android/app/src/main/res/mipmap-hdpi/ic_launcher.png
cp assets/AppIcons/android/mipmap-hdpi/ic_launcher.png android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png
cp assets/AppIcons/android/mipmap-hdpi/ic_launcher.png android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
```

- [ ] **Step 3: Verify**

```bash
ls android/app/src/main/res/mipmap-hdpi/
```

Expected:
```
ic_launcher.png  ic_launcher_foreground.png  ic_launcher_round.png
```

---

### Task 4: Replace Android mipmap-xhdpi icons

**Files:**
- Modify: `android/app/src/main/res/mipmap-xhdpi/` (96×96)

- [ ] **Step 1: Remove existing WebP files**

```bash
rm android/app/src/main/res/mipmap-xhdpi/ic_launcher.webp
rm android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.webp
rm android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.webp
```

- [ ] **Step 2: Copy PNG icon under all three required names**

```bash
cp assets/AppIcons/android/mipmap-xhdpi/ic_launcher.png android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
cp assets/AppIcons/android/mipmap-xhdpi/ic_launcher.png android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png
cp assets/AppIcons/android/mipmap-xhdpi/ic_launcher.png android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
```

- [ ] **Step 3: Verify**

```bash
ls android/app/src/main/res/mipmap-xhdpi/
```

Expected:
```
ic_launcher.png  ic_launcher_foreground.png  ic_launcher_round.png
```

---

### Task 5: Replace Android mipmap-xxhdpi icons

**Files:**
- Modify: `android/app/src/main/res/mipmap-xxhdpi/` (144×144)

- [ ] **Step 1: Remove existing WebP files**

```bash
rm android/app/src/main/res/mipmap-xxhdpi/ic_launcher.webp
rm android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.webp
rm android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.webp
```

- [ ] **Step 2: Copy PNG icon under all three required names**

```bash
cp assets/AppIcons/android/mipmap-xxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
cp assets/AppIcons/android/mipmap-xxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png
cp assets/AppIcons/android/mipmap-xxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
```

- [ ] **Step 3: Verify**

```bash
ls android/app/src/main/res/mipmap-xxhdpi/
```

Expected:
```
ic_launcher.png  ic_launcher_foreground.png  ic_launcher_round.png
```

---

### Task 6: Replace Android mipmap-xxxhdpi icons

**Files:**
- Modify: `android/app/src/main/res/mipmap-xxxhdpi/` (192×192)

- [ ] **Step 1: Remove existing WebP files**

```bash
rm android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.webp
rm android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.webp
rm android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.webp
```

- [ ] **Step 2: Copy PNG icon under all three required names**

```bash
cp assets/AppIcons/android/mipmap-xxxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
cp assets/AppIcons/android/mipmap-xxxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png
cp assets/AppIcons/android/mipmap-xxxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
```

- [ ] **Step 3: Verify all Android mipmap directories are clean**

```bash
find android/app/src/main/res/mipmap-* -name "*.webp"
```

Expected: no output (no `.webp` files remaining)

- [ ] **Step 4: Commit all Android icon changes**

```bash
git add android/app/src/main/res/mipmap-mdpi/ \
        android/app/src/main/res/mipmap-hdpi/ \
        android/app/src/main/res/mipmap-xhdpi/ \
        android/app/src/main/res/mipmap-xxhdpi/ \
        android/app/src/main/res/mipmap-xxxhdpi/
git commit -m "feat(android): replace app icon with brand assets"
```
