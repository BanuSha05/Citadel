# CITADEL

### Climate-Aware. Thermally Optimized. Field-Ready.

**Area-Specific Passive Shelter Design & Thermal Evaluation Platform**

**Team:** THE PARALLAX  
**Smart India Hackathon 2026 — SIH26051**  
**Problem Statement:** Software Based Model Development for Design of Area Specific Shelter for Thermal Comfort Maintenance  
**Organization:** DRDO – Department of Defence R&D  
**Category:** Software

---

## 1. Overview

CITADEL is an area-specific shelter design and thermal evaluation platform that connects local climate conditions with parametric shelter design and physics-based thermal analysis.

It enables users to evaluate how **materials, geometry, insulation, openings, orientation, occupancy, and environmental conditions** influence shelter thermal behaviour. The platform follows an **offline-first** approach for remote and connectivity-constrained environments.

### Workflow

```text
Location → Climate → Shelter Requirements → Parametric Design
→ Thermal Physics → Evaluation → Comparison → Optimization
→ Final Design → Engineering Report
```

## 2. Problem Context

Generic shelter designs may not adequately account for regional climatic conditions. Variations in **ambient temperature, solar radiation, humidity, orientation, material properties, insulation, dimensions, and openings** can significantly affect indoor thermal conditions.

CITADEL addresses this through a location-aware, physics-based workflow for evaluating shelter configurations under defined environmental conditions, supporting passive thermal design and reduced dependence on external heating and cooling systems.

## 3. Proposed Solution

Users can configure location, climate parameters, shelter dimensions, materials, insulation, openings, orientation, occupancy, and design constraints. Candidate configurations are evaluated using the thermal engine and compared to support data-driven design decisions.

---

## 4. Key Features

- **Location-Aware Design** — Device location or manual input for area-specific conditions.
- **Offline Location & Orientation** — Device GPS and motion sensors without continuous internet dependency.
- **Climate Profiles** — Temperature, solar radiation, humidity, and related environmental parameters.
- **Parametric Shelter Design** — Geometry, dimensions, materials, insulation, openings, orientation, and occupancy.
- **Physics-Based Thermal Analysis** — Custom **1D RC thermal network model** for indoor temperature, solar heat gain, heat flow, and 24-hour thermal behaviour.
- **3D Visualization** — Interactive shelter visualization using **Three.js, React Three Fiber, and Drei**.
- **Design Comparison** — Comparison of saved shelter configurations using thermal evaluation results.
- **Optimization Support** — Exploration of configurations using thermal performance and defined constraints.
- **ML Surrogate Layer** — Machine-learning-based prediction for faster repeated evaluation and design exploration.
- **Offline-First Operation** — Local application assets and climate/design data support core offline functionality.
- **Local Persistence** — Saves designs and results across sessions.
- **PDF Reports** — Offline engineering reports containing design and thermal results.
- **My Designs** — Stores and manages previously evaluated configurations.

---

## 5. Technical Architecture

```text
User Input
    ↓
Location & Orientation
    ↓
Offline Climate Data
    ↓
Shelter Configuration
    ↓
Thermal Physics Engine
    ↓
Thermal Results
    ↓
ML Surrogate
    ↓
Optimization
    ↓
Design Comparison
    ↓
Validation
    ↓
Final Design
    ↓
Engineering Report
```

The **Thermal Physics Engine** is the primary computational layer. The ML surrogate layer supports accelerated prediction and design-space exploration.

---

## 6. Technology Stack

| Technology | Purpose |
|---|---|
| React 19 + TypeScript | Frontend and application interface |
| Vite | Development and production build |
| Custom TypeScript Thermal Engine | 1D RC network thermal computation |
| Three.js | 3D visualization |
| React Three Fiber + Drei | Interactive 3D visualization |
| Recharts | Thermal data visualization |
| LocalStorage | Local persistence |
| Vite PWA | Offline-capable web deployment |
| Capacitor Android | Android deployment |
| Lucide React | Interface icons |
| jsPDF + AutoTable | Offline PDF generation |
| ANSYS | Independent 3D thermal validation reference |

---

## 7. Installation

### Prerequisites

- Node.js (LTS recommended)
- npm
- Git
- Android Studio + Android SDK — for Android development
- JDK 17 — for Android builds

Verify:

```bash
node --version
npm --version
git --version
java --version
```

### Clone and Install

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_FOLDER>
npm install
```

---

## 8. Web Application

Start development:

```bash
npm run dev
```

Open the URL shown by Vite, normally:

```text
http://localhost:5173
```

Create a production build:

```bash
npm run build
```

Production files are generated in `dist/`.

Preview the production build:

```bash
npm run preview
```

---

## 9. PWA / Offline Deployment

CITADEL uses **Vite PWA** functionality for offline-capable deployment.

```bash
npm run build
```

The core offline workflow uses cached application assets and local persistence rather than requiring continuous network connectivity.

---

## 10. Android Application

CITADEL can be packaged using **Capacitor**.

If Android has not been added:

```bash
npx cap add android
```

After frontend changes:

```bash
npm run build
npx cap sync android
npx cap open android
```

Run the project from Android Studio on a connected device or emulator.

### Build APK

From the project root:

```bash
npm run build
npx cap sync android
```

**Linux / macOS**

```bash
cd android
./gradlew assembleDebug
```

**Windows**

```powershell
cd android
.\gradlew.bat assembleDebug
```

APK output:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### Android Notes

Use **JDK 17** and ensure the required Android SDK components are installed. Location features require appropriate Android permissions. GPS and sensor accuracy depend on the device and environment.

---

## 11. Thermal Evaluation Model

CITADEL uses a **1D RC thermal network model** for comparative shelter evaluation.

The model considers:

- Shelter envelope
- Material thermal properties
- Thermal resistance and capacitance
- Ambient conditions
- Solar heat gain
- Openings
- Occupancy/internal conditions

Outputs include:

- Indoor temperature
- Solar heat gain
- Heat-flow behaviour
- Time-dependent thermal response

The current thermal engine is intended for **comparative design evaluation and exploration**.

---

## 12. Machine Learning Layer

The ML surrogate layer is intended to accelerate repeated thermal prediction during design-space exploration.

It learns relationships between relevant environmental/design parameters and thermal responses, allowing candidate configurations to be evaluated more rapidly.

Before reporting model performance, the ML model should be assessed using training, validation, and held-out test data. Suitable regression metrics include **R², MAE, RMSE, and MAPE**.

No unverified accuracy value is claimed in this repository.

---

## 13. Optimization

The design space can include:

- Dimensions
- Geometry
- Orientation
- Material combinations
- Insulation
- Openings
- Other design constraints

CITADEL supports **multi-objective optimization using NSGA-II** for exploring feasible thermal-design alternatives and associated trade-offs.

---

## 14. 3D Visualization

The shelter configuration is represented using:

- **Three.js**
- **React Three Fiber**
- **Drei**

The 3D layer provides an interactive representation of shelter geometry alongside thermal evaluation results.

---

## 15. Offline-First Architecture

Offline-oriented components include:

- Cached application assets
- Local climate/design data
- LocalStorage persistence
- Saved design history
- Offline PDF report generation
- Device-based location and orientation

This architecture is intended for remote and connectivity-constrained environments.

---

## 16. Validation

The CITADEL thermal engine provides a physics-based engineering estimate for comparative shelter design and thermal evaluation.

**ANSYS** can be used as an independent validation environment for selected 3D shelter geometries and thermal cases. Results from the simplified model can be compared with detailed numerical simulation for selected configurations.

ANSYS is a validation/reference environment, not a runtime dependency of the core application.

---

## 17. Repository Structure

```text
CITADEL/
├── android/              # Capacitor Android project
├── public/               # Static assets
├── src/                  # Application source
├── dist/                 # Production build output
├── package.json          # Dependencies and scripts
├── vite.config.*         # Vite configuration
├── tsconfig*.json        # TypeScript configuration
└── README.md             # Project documentation
```

The source structure may evolve during development.

---

## 18. Development Workflow

```bash
npm install
npm run dev
npm run build
npx cap sync android
npx cap open android
```

After frontend changes, run `npm run build` before `npx cap sync android`.

---

## 19. Release Checklist

- [ ] Location and permission flow
- [ ] Manual location input
- [ ] Orientation/sensor functionality
- [ ] Climate parameters
- [ ] Material properties
- [ ] Shelter configuration
- [ ] Thermal calculations
- [ ] 3D visualization
- [ ] Design saving/comparison
- [ ] Offline operation
- [ ] PDF reports
- [ ] Android installation
- [ ] Thermal validation cases
- [ ] No unverified accuracy claims

---

## 20. Submission Links

Replace these placeholders before SIH submission:

- **Live Application:** `<DEPLOYMENT_URL>`
- **GitHub Repository:** `<GITHUB_REPOSITORY_URL>`
- **Android APK:** `<APK_RELEASE_URL>`
- **Project Demo:** `<YOUTUBE_VIDEO_URL>`

---

## 21. Team

**THE PARALLAX**

**Project:** CITADEL  
**SIH 2026 Problem Statement:** SIH26051 - Software Based Model Development for Design of Area Specific Shelter for Thermal Comfort Maintenance.

---

## 22. Disclaimer

CITADEL is a software-based engineering decision-support and comparative thermal evaluation platform. Its outputs should be independently verified for real-world deployment, structural safety, construction feasibility, and site-specific engineering requirements.
