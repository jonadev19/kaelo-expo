# Splash Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure the native Expo splash screen using the Kaelo brand icon on a dark emerald background.

**Architecture:** Single config change in `app.json` — update the `splash` block to point to the brand icon (`assets/AppIcons/appstore.png`) with background color `#064E3B`. No code changes required.

**Tech Stack:** Expo (app.json splash config)

---

### Task 1: Update splash screen config

**Files:**
- Modify: `app.json`

- [ ] **Step 1: Update `app.json` splash block**

In `app.json`, replace the `"splash"` block:

```json
"splash": {
  "image": "./assets/AppIcons/appstore.png",
  "resizeMode": "contain",
  "backgroundColor": "#064E3B"
},
```

- [ ] **Step 2: Verify with dev server**

Run: `yarn start`

Open the app on a simulator or device. The splash should show the Kaelo icon centered on a dark green background before the app loads.

- [ ] **Step 3: Commit**

```bash
git add app.json docs/superpowers/specs/2026-04-15-splash-screen-design.md docs/superpowers/plans/2026-04-15-splash-screen.md
git commit -m "feat(splash): use brand icon on dark emerald background"
```
