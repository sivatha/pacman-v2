# PAC-MAN V2 🕹️

A high-performance, arcade-faithful Pac-Man recreation built with modern web standards: **React 19.2**, **Vite 8.2**, **Tailwind CSS 4.3**, and **TypeScript**.

## 🚀 Key Features

- **Authentic Ghost AI Mechanics**:
  - **Blinky (Red)**: Direct chaser targeting Pac-Man's exact tile coordinates, with Cruise Elroy acceleration.
  - **Pinky (Pink)**: Ambush hunter targeting 4 tiles ahead of Pac-Man.
  - **Inky (Cyan)**: Pincer flanker using both Blinky and Pac-Man's positions.
  - **Clyde (Orange)**: Erratic roamer chasing from afar and retreating when within 8 tiles.
- **Procedural Web Audio API Engine**:
  - Authentic alternating "waka" chomp square waves (220Hz / 180Hz).
  - 5-tone ascending Power Pellet arpeggios.
  - Ghost-eating combo score chimes (200, 400, 800, 1600).
  - 13-tone descending chromatic death sweep.
  - Level-modulated ambient continuous ghost sirens and frightened warbles.
- **Delta-Time Normalization (`dt`)**:
  - 100% framerate-independent speed scaling (runs at identical arcade velocity on 60Hz, 120Hz ProMotion, and 144Hz+ displays).
- **Interactive Controls & Sizing**:
  - Customizable game speed multipliers: `1.0x Normal`, `1.25x Fast`, and `1.5x Turbo`.
  - Starting Level jump options (Levels 1, 2, 3, 5, 10, 15, 20).
  - Scaled arcade cabinet layout with pixelated integer canvas rendering.
- **Multi-Device Support**:
  - Desktop keyboard: Arrow keys / WASD, Space/Enter, P/Esc to pause.
  - Mobile & Tablet: Touch swipe gestures + on-screen virtual retro D-Pad.
  - Fullscreen API toggle.
- **Full-Screen Arcade Pages**:
  - **Rules & User Manual Page**: Detailed ghost mechanics, scoring tables, and strategy tips.
  - **Developer Profile Page**: Developer background, project architecture, and engineering highlights.

## 🛠️ Tech Stack

- **Framework**: React 19.2
- **Build Tool**: Vite 8.2
- **Styling**: Tailwind CSS 4.3
- **Language**: TypeScript
- **Audio**: Web Audio API (zero external audio file dependencies)
- **Icons**: Google Material Symbols Rounded

## 📦 Getting Started

### Installation
```bash
npm install
```

### Run Locally
```bash
npm run dev
```
Open `http://localhost:5175/` in your browser.

### Production Build
```bash
npm run build
```

## 👨‍💻 Developer
- **SUON Sivatha** — Full-Stack Developer & Software Engineer
- **Institution**: Norton University
- **Contact**: sivatha.net@gmail.com

---
© 2026 SUON Sivatha — All Rights Reserved.  
*Original PAC-MAN is a trademark of Bandai Namco Entertainment Inc.*
