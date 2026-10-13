# 🕹️ PIXEL CLAW Machine v2.0

<p align="right">
  🌐 <b>Language / 語言 / 言語:</b>
  <a href="./README.md">繁體中文</a> |
  <b>English</b> |
  <a href="./README.ja.md">日本語</a>
</p>

> Pure native HTML5 + Canvas 2D hand-drawn 8-Bit pixel-art arcade claw machine Web App.  
> Featuring custom rigid-body physics, crane pendulum inertia swing, 6 permanent RPG cabinet upgrades, 4 theme cabinets, 3-tier difficulty doll stacks, and special physics-driven dolls!

---

## 🌟 Play Online Now

👉 **[Play PIXEL CLAW Machine (Classic 2D Full Arcade)](https://opluke11-abula.github.io/pixel-claw-machine/)**  
👉 **[Experience PIXEL CLAW 2.5D Isometric Arcade (4-Way Depth Aiming Prototype)](https://opluke11-abula.github.io/pixel-claw-machine/prototype_25d.html)**  
*(Static single-file web pages, zero installation required, runs smoothly on both desktop and mobile browsers)*

---

## 🎮 Core Features

- **Zero-Dependency Single-File Architecture**:
  - Fully contained in a single `index.html` (and `prototype_25d.html` for 2.5D), built with pure native Canvas 2D rendering and Web Audio API square-wave synthesis. No external npm or framework dependencies.
- **Custom 2D Rigid-Body Physics Engine**:
  - Crane gantry acceleration drives realistic pendulum angular velocity and damping oscillations (enabling authentic crane-swinging techniques).
  - Circle rigid bodies, Continuous Collision Detection (CCD) to prevent tunneling, capsule claw arm segment pushing, and authentic hole-drop resolution.
- **4 Switchable Theme Cabinets**:
  - 🧸 **Animal Paradise**: Classic introductory cabinet, ideal for early coin accumulation.
  - 💖 **Dreamy Fantasy**: Light and whimsical, featuring high-bounciness slime and floating balloons.
  - ⚙️ **Iron Machinery**: High-difficulty industrial challenge packed with heavy iron golems and gravity blocks.
  - 🧪 **Mystic Slime**: Chaotic chain reactions with extreme elasticity and domino push dynamics.
- **3-Tier Difficulty Stack with 95 Dolls**:
  - **Surface Layer (40 dolls)**: Standard small dolls ($r=8$, weight $1.0$).
  - **Middle Layer (35 dolls)**: Special feature dolls ($r=11\sim 12$, mystery chest, explosive bomb, gravity star, floating balloon, bouncy slime).
  - **Deep Bottom Layer (20 dolls)**: Legendary giant boss dolls ($r=16\sim 17$, $4\times$ pixel volume, weight $2.8\sim 4.0$), requiring claw size upgrades to catch.
- **🎁 Mystery Chest & 🚜 Excavator Mega Scoop**:
  - **Mystery Chest**: Catch the sparkling middle-layer chest to activate an extraordinary perk—the next round transforms the claw into a massive **🚜 Industrial Excavator Bucket**!
  - **Mega Scoop Action**: Extra-wide bucket with hazard stripes scoops 3 to 7 dolls at once, returning to dump the entire hoard into the chute for a massive jackpot.
  - **Shop Pass**: Excavator scoop passes are also available in the shop for 350🪙 anytime.
- **6 Permanent RPG Machine Upgrades**:
  - 🧵 **Longer Cable**: Extends maximum downward claw reach to access deep bottom prizes.
  - ⚙️ **Stronger Motor**: $+20\%$ base grip torque, reducing mid-air slip rates.
  - ⏳ **Extra Time**: Adds $+4\text{s}$ aiming countdown per credit.
  - ⚡ **High-Speed Gear**: $+15\%$ gantry movement and hoist speed.
  - 🧤 **Giant Claw**: **Crucial Core Upgrade!** Proportionally expands claw visual size and physics collision radius by $+20\%$, enabling capture of legendary giant dolls.
  - 🌟 **Lucky Star**: Increases spawn rate of rare and legendary dolls during restocks.
- **⚡ Double-Tap Early Close (Manual Claw Grab)**:
  - Say goodbye to helpless waiting while the claw descends! During descent, the button dynamically transforms into `🛑 Close Claw`. Press `Space` or tap the button to close the claw mid-air at any depth to intercept floating balloons or high-perched targets.
- **🔥 FEVER TIME Combo Frenzy**:
  - Consecutive wins (Combo $\ge 2$) ignite FEVER mode! The cabinet marquee bulbs cycle into rainbow chase mode at double speed, HUD displays `FEVER xN`, and each won doll grants bonus coins (+25~100🪙)!
- **💰 Rainbow Money Bag Jackpot**:
  - Middle layer features a lucky money bag doll. Dropping it into the chute triggers a direct jackpot (+160~260 🪙 coins) with screen-wide fireworks particles.
- **QOL & Satisfying Audio/Visual Feedback**:
  - ⏩ **2X Turbo Mode**: Toggle instantly via top-right button or key `F` for doubled simulation tempo.
  - 🔄 **3-Minute Restock Cooldown**: Cleaned out the cabinet? Hit restock to organically refill all 95 dolls.
  - 💥 **Screen Shake & Bass**: Bomb detonations produce intense screen shake and custom low-frequency square-wave blasts.
  - 🎯 **Vertical Laser Aiming Line**: Optical red dashed laser eliminates parallax aiming errors.
  - ✨ **Golden Sparkle Aura**: Pity trigger and power buffs coat the claw in radiant golden particles.
  - 🏆 **13 Arcade Achievements**: Challenges including "Fever Master", "Excavator God", "Lucky Bag Tycoon", "Full Dex Collector", and more.
  - 💰 **One-Click Duplicate Selling**: Sell duplicate collection items for coins in the Dex modal.
  - 🚨 **Arcade Pity System**: Every 300🪙 invested guarantees a 100% win rate golden claw!

- **🎮 2.5D Isometric Arcade Edition (`prototype_25d.html`)**:
  - **4-Way Dual-Axis Aiming**: Full D-pad and WASD control for $(X, Z)$ depth and horizontal travel.
  - **Height-Adaptive Dynamic Shadow (`getUnderSurfaceHeight`)**: Shadow dynamically climbs and snaps to doll top surfaces, eliminating depth parallax.
  - **True 3D Rigid-Body Mound Physics**: 60 isometric dolls simulate natural sphere-sphere impulse collisions, forming organic mounds behind acrylic chute barriers.
  - **Neo-Arcade Cabinet**: 14 animated marquee bulbs (rainbow cycle in FEVER mode), acrylic glass reflections, sunken chute well, and boss Ah-Tsai interactive dialogue.
  - **8 Distinct Isometric Dolls**: Teddy bear, bunny, chick, cat, frog, chest, money bag, and golden king cat.

---

## 🕹️ Controls & Hotkeys

### Classic 2D Controls
| Action | Keyboard | Touch / Mobile |
|---|---|---|
| **Insert Coin (10🪙/play)** | `Enter` / `C` | Tap "投幣 10 元 (Insert Coin)" |
| **Move Crane Left/Right** | `←` `→` or `A` `D` (Hold to accelerate) | Hold virtual "◀" / "▶" buttons |
| **Drop Claw** | `Space` / `↓` | Tap virtual "下爪 (Drop)" button |
| **Double-Tap Early Close** | While descending: `Space` / `↓` | Tap "🛑 合爪 (Close)" button |
| **Toggle 2X Turbo Speed** | `F` | Tap top-right "▶ 1X / ⏩ 2X" |
| **Switch Theme Cabinet** | Top-right dropdown menu | Top-right dropdown menu |
| **Restock Cabinet** | Tap "🔄 重整機台 (Restock)" | Tap "🔄 重整機台 (Restock)" |
| **Mute Audio** | `M` | Tap "🔊 / 🔇" icon |

### 2.5D Isometric Controls
| Action | Keyboard | Touch / Mobile |
|---|---|---|
| **Depth Movement (In/Out)** | `W` (Deep) / `S` (Forward) or `↑` `↓` | Tap D-pad "▲ 深入" / "▼ 靠前" |
| **Horizontal Movement (L/R)** | `A` (Left) / `D` (Right) or `←` `→` | Tap D-pad "◀ 往左" / "▶ 往右" |
| **Drop Claw** | `Space` | Tap "🎯 下爪抓取 (Drop Claw)" |
| **Early Close** | While descending: `Space` | Tap "🛑 提前合爪 (Early Close)" |
| **Toggle 2X Speed** | `F` | Tap "⏩ 2X倍速 (2X Speed)" |

---

## 📚 Technical Documentation

- **[Specification (SPEC.md)](./SPEC.md)**: System finite-state machine, collision physics formulas, claw grip algorithms, economy balance, and 16 verification checklists (including Chapter 14 for 2.5D).
- **[Handoff & Architecture (handoff.md)](./handoff.md)**: Designed for peer review and maintenance, covering dynamic claw scaling, grip quality formulas, and Playwright E2E verification logs.
- **[2.5D Design Specification](./docs/superpowers/specs/2026-10-13-25d-claw-machine-evolution-design.md)**: Mathematical isometric projection matrix, height-adaptive shadow algorithms, 3D stack physics, and cabinet aesthetic design.
- **[2.5D Implementation Plan](./docs/superpowers/plans/2026-10-13-25d-claw-machine-evolution.md)**: 6-task roadmap with unit tests and E2E verification checklists.

---

## 🎨 Credits & Licenses

- **Author**: Luke Yu (Department of Computer Science & Information Engineering, Chung Yuan Christian University) × AI (Vibe Coding Project)
- **Chinese Font**: [Cubic 11 (俐方體11號)](https://github.com/ACh-K/Cubic-11) (SIL Open Font License 1.1)
- **English Font**: Press Start 2P (Google Fonts)
