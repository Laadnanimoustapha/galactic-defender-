# 🚀 Galactic Defender

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Canvas](https://img.shields.io/badge/HTML5-Canvas-E34F26?style=for-the-badge&logo=html5)
![Web Audio](https://img.shields.io/badge/Web_Audio-API-FF6F00?style=for-the-badge)

[![Free Palestine](https://img.shields.io/badge/Free-Palestine-CE1126?labelColor=000000&color=007A3D&style=for-the-badge)](#support-palestine)

**An action-packed space shooter built with Next.js, HTML5 Canvas, and Web Audio API.**

Defend the galaxy against waves of increasingly dangerous enemies using rockets, homing missiles, and energy shields!

</div>

---

## 🎮 Features

### Core Gameplay
- 🛸 **4 Enemy Types** — Basic drones, fast chasers, armored tanks, and devastating bosses
- 🔫 **3 Weapon Systems** — Rapid-fire bullets, explosive rockets, and homing missiles
- 🛡️ **Energy Shield** — Temporary invulnerability barrier
- 🌊 **Wave Progression** — Survive increasingly difficult waves with countdown transitions
- ⚡ **Combo System** — Chain kills for higher scores with decay timer
- 💎 **Power-Up Drops** — Collect health, energy, and score bonuses from defeated enemies
- 🏆 **High Score Persistence** — Your best score saved in localStorage

### Enemies Fight Back!
- 👹 **Enemy Shooting** — Basic drones and tanks fire projectiles at you
- 🎯 **Boss Spread Attacks** — Bosses fire lethal patterns
- ❤️ **Enemy Health Bars** — Visible HP on tanks and bosses

### Visual & Audio
- 🌌 **Parallax Starfield** — Multi-layer scrolling stars with twinkling and nebula glow
- 💥 **Screen Shake** — Camera shakes on damage and boss kills
- 🎵 **Synthesized SFX** — 9 unique procedurally-generated sounds (Web Audio API)
- ✨ **Particle Explosions** — Scaled by enemy type (boss = massive boom)
- 🔮 **Glowing Shield Effect** — Pulsating protective aura

### UI & HUD
- 📊 **Advanced HUD** — Score, health, energy, wave progress, kill counter, survival timer
- ⏱️ **Cooldown Indicators** — Circular progress for each weapon skill
- 🔴 **Boss Health Bar** — Full-width HP bar during boss fights
- ⏸️ **Pause Menu** — Resume, Restart, Quit with blur overlay
- 🏁 **Rich Game Over** — Stats grid with wave, kills, max combo, time survived
- ⭐ **New High Score Celebration** — Special golden UI when you beat your record
- 📢 **Wave Announcements** — Animated "WAVE X INCOMING" banner between waves

## 🎯 Controls

| Key | Action |
|-----|--------|
| `WASD` / Arrow Keys | Move ship |
| `Space` | Fire bullets (auto-spread at 500+ score) |
| `R` | Launch rocket (20 energy) |
| `T` | Fire homing missile (30 energy) |
| `E` | Activate shield (25 energy, 5s duration) |
| `ESC` / `P` | Pause game |

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** | React framework & SSR |
| **TypeScript** | Type-safe game logic |
| **HTML5 Canvas** | 60fps game rendering |
| **Web Audio API** | Procedural sound synthesis |
| **Tailwind CSS 4** | UI styling |
| **Shadcn/UI** | Menu & HUD components |
| **Object Pooling** | Zero-GC entity management |

## 📐 Architecture

```
lib/game/
├── GameEngine.ts      # Core game loop, physics, collisions
├── InputManager.ts    # Keyboard input handling
├── SoundManager.ts    # Web Audio API synthesized SFX
├── config.ts          # Game balance constants
├── types.ts           # TypeScript interfaces
├── entities/
│   ├── Entity.ts      # Base entity class
│   ├── Player.ts      # Ship rendering & movement
│   ├── Enemy.ts       # 4 enemy types with shooting AI
│   ├── Projectile.ts  # Bullets, rockets, homing missiles
│   ├── Particle.ts    # Explosion particle system
│   ├── PowerUp.ts     # Collectible drops
│   └── Starfield.ts   # Parallax background
└── utils/
    └── ObjectPool.ts  # Memory-efficient entity recycling
```

---

<div align="center">

### 📏 Lines of Code

```
╔══════════════════════════════════════════╗
║                                          ║
║       ⚡  7,534  LINES OF CODE  ⚡       ║
║                                          ║
╚══════════════════════════════════════════╝
```

---

<br/>

```
 ██████╗  █████╗ ██╗      █████╗  ██████╗████████╗██╗ ██████╗
██╔════╝ ██╔══██╗██║     ██╔══██╗██╔════╝╚══██╔══╝██║██╔════╝
██║  ███╗███████║██║     ███████║██║        ██║   ██║██║     
██║   ██║██╔══██║██║     ██╔══██║██║        ██║   ██║██║     
╚██████╔╝██║  ██║███████╗██║  ██║╚██████╗   ██║   ██║╚██████╗
 ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝
██████╗ ███████╗███████╗███████╗███╗   ██╗██████╗ ███████╗██████╗ 
██╔══██╗██╔════╝██╔════╝██╔════╝████╗  ██║██╔══██╗██╔════╝██╔══██╗
██║  ██║█████╗  █████╗  █████╗  ██╔██╗ ██║██║  ██║█████╗  ██████╔╝
██║  ██║██╔══╝  ██╔══╝  ██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗
██████╔╝███████╗██║     ███████╗██║ ╚████║██████╔╝███████╗██║  ██║
╚═════╝ ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝
```

---

![Made By Laadnani](https://img.shields.io/badge/🚀_MADE_BY-LAADNANI-0ff?style=for-the-badge&labelColor=0a0a1a&color=00e5ff)
![Author](https://img.shields.io/badge/AUTHOR-Laadnani_Mustapha-blueviolet?style=for-the-badge&logo=github)

**[🌐 Visit GitHub Profile](https://github.com/Laadnanimoustapha)**

</div>
