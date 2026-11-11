# TomeXR

[![WebXR](https://img.shields.io/badge/WebXR-Meta_Quest-0081FB?logo=meta&logoColor=white)](https://tome-xr.vercel.app/)
[![IWSDK](https://img.shields.io/badge/IWSDK-v1.1.0--rc.2-1877F2)](https://developers.meta.com/horizon/documentation/web/iwsdk-guide-project-setup)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Tactical 3D Harbor & Mooring Planner for Meta Quest. Built with Meta Immersive Web SDK (IWSDK).

- **Live WebXR Demo**: https://tome-xr.vercel.app/
- **Repository**: https://github.com/vero-code/tome-xr
- **Competition Track**: Gaming / Productivity (Meta VR Start Developer Competition 2026)

## Overview

Mooring a 50,000–100,000 ton container ship is one of the most critical maritime maneuvers. Captains face massive 50–100 meter blind spots from the aft bridge, zero brake pedals, and immense hydrodynamic momentum where contact speeds must remain under 5–10 cm/s to avoid crushing pier structures.

**TomeXR** functions as an interactive "360° parking assistant" for ship captains and navigators. Rendered as a seated tactical 3D tabletop diorama in WebXR, it enables hands-first rehearsal of docking approaches under varying winds, currents, and tug configurations before real-world execution.

### Key Capabilities

- **Hydrodynamic Physics Simulation**: Real-time 2D planar vessel physics calculating linear and angular momentum, hull drag, wind forces, and water currents.
- **Predictive Drift Trajectory**: Forward projection arc displaying where the vessel will drift and rotate 30 seconds into the future based on active forces.
- **Tugboat Assistance & Vectors**: Direct-grab tugboats with directional towlines that apply calibrated push and pull forces to vessel bow and stern stations.
- **Laser Fender Guides**: Real-time laser distance lines measuring clearance and approach speeds between pier fenders and the ship hull.
- **Impact Feedback System**: Color-coded contact detection (Green = safe touch under 5 cm/s, Yellow = caution, Red = critical impact velocity).
- **Tactical Scenarios**:
  1. *Calm Water*: Baseline manual mooring approach.
  2. *Crosswind*: Offshore wind demanding bow tug counter-forces.
  3. *Narrow Basin & Current*: Combined wind and current requiring coordinated dual-tug maneuvering.

### Hands-First Design Principles

- **Pinch & Drag**: Grab the cargo vessel to set heading and momentum; pull tugboats to position them and stretch towlines.
- **Finger Poke**: Physical push-buttons to select scenarios and toggle simulation play/pause.
- **Tracking Guard**: Smooth input filtering and anchor tracking to eliminate jitter and prevent abrupt jumps on occlusion.
- **Airplane Seat Test**: Fully operable seated within a 60 cm sphere in front of the user without roomscale locomotion.

## Tech Stack

- **Framework**: Meta Immersive Web SDK (IWSDK v1.1.0-rc.2)
- **Engine**: Three.js (via `@iwsdk/core`)
- **Language**: TypeScript 5.5
- **Bundler**: Vite 7
- **UI**: IWSDK UIKitML / Horizon kit
- **Target Platform**: Meta Quest (Meta Quest 3 / Pro / 3S via WebXR)

## Getting Started

### Prerequisites

- Node.js `>=20.19.0`
- npm

### Installation

```sh
npm install
```

### Local Development

Runs the local development server with the integrated Meta Quest IWER emulator:

```sh
npm run dev
```

Open the reported local URL in Chromium to interact using mouse and emulated hands.

## Controls & Workflow

### Desktop IWER Emulator Controls

When running locally without a VR headset:

- **Look Around**: Hold **Right Mouse Button** and move the mouse to rotate the camera.
- **Hand Position**: Move the mouse to position the active virtual hand.
- **Pinch / Grab**: Hold **Left Mouse Button** to close index and thumb (grabs the ship or tugboat).
- **Switch Hand**: Press **Shift** or **Ctrl** to alternate between right and left hands.
- **Button Poke**: Move the hand's index finger directly into a button (or aim the reticle and click).

### Step-by-Step Workflow Walkthrough

1. **Scenario 1 (Calm Mooring)**:
   - Tap **Scenario 1** button on the bottom table console.
   - The vessel drifts gently along the predicted trajectory without wind.
   - Pinch-grab the ship hull to guide its initial approach.
   - Watch the laser guides from the pier fenders; entering the green berth zone at safe contact speed (< 5 cm/s) displays the **DOCKED SAFELY!** victory banner.

2. **Scenario 2 (Crosswind & Tug Assistance)**:
   - Tap **Scenario 2** button; the weather dial rotates, and a crosswind pushes the ship offshore.
   - A bow tugboat spawns in clear water on the right.
   - Pinch-grab the tugboat and bring it near the vessel's bow station.
   - Stretch the yellow towline toward the pier to apply counteracting thrust and prevent wind drift.

3. **Scenario 3 (Narrow Basin & Dual Tugs)**:
   - Tap **Scenario 3** button for combined wind and water current forces.
   - Two tugboats (bow and stern) are available to balance rotational torque and hold the vessel parallel to the pier wall.

4. **Simulation Pause**:
   - Tap the large green toggle button on the left edge of the table to pause or resume real-time vessel dynamics and drift prediction.

### Type Check

```sh
npm run typecheck
```

### Production Build

```sh
npm run build
```

The output bundle is generated in the `dist/` directory.

## License

[Apache-2.0](LICENSE)
