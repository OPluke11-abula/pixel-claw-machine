# PIXEL CLAW 2.5D 全面進化的等角立體街機 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將 `prototype_25d.html` 從 30% 粗糙原型全面重構升級為 100% 完整街機沉浸感、真 3D 剛體堆疊物理、高度自適應立體陰影投影與全套經濟循環的旗艦 2.5D 夾娃娃機。

**Architecture:** 單檔案零依賴架構（Vanilla HTML5 + Canvas 2D + Web Audio API），採用等角投影矩陣（Isometric 2:1）、Depth Sorting 深度排序緩衝區、3D 球體 Verlet/Euler 碰撞物理、動態高度陰影吸附演算法與 localStorage 本地持久化。

**Tech Stack:** 原生 HTML5, Canvas 2D API, Web Audio API, ES6 JavaScript, Playwright

**Spec:** `docs/superpowers/specs/2026-10-13-25d-claw-machine-evolution-design.md`

## Global Constraints

- **Single-File Zero-Dependency**: 所有邏輯、樣式、音效與畫面必須完整封裝於 `prototype_25d.html`，嚴禁引入外部 npm/CDN 依賴（除了已有的字型 CDN）。
- **Pixel Art Purity**: 畫布必須使用 `image-rendering: pixelated; image-rendering: crisp-edges;`，禁止平滑模糊。
- **Cross-Platform**: 支援鍵盤（WASD / 方向鍵 / Space / Enter）與觸控 D-pad 面板雙操作。
- **No Global Name Collision**: 透過 IIFE 模組封裝，對外僅掛載 `window.Prototype25D` 作為測試與除錯鉤子。

---

### Task 1: 3D 剛體物理堆疊系統 (3D Rigid-Body Physics & Stack Generation)

**Files:**
- Modify: `d:/GitHub/pixel-claw-machine/prototype_25d.html:280-450`
- Test: `scratch/test_25d_physics.js`

**Interfaces:**
- Consumes: 3D 空間邊界 `BOX_X = 74, BOX_Z = 54, BOX_TOP_Y = 195`
- Produces: 娃娃陣列 `prizes`，每個娃娃具備 3D 物理屬性 `{ id, type, x, y, z, vx, vy, vz, r, w, held, dropping }`，並由 `step3DPhysics(dt)` 驅動碰撞與推擠。

- [x] **Step 1: 編寫 3D 物理引擎單元測試腳本**

```javascript
// scratch/test_25d_physics.js
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('D:/GitHub/pixel-claw-machine/prototype_25d.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error('No script tag found');

// 模擬基礎 DOM 環境
const dom = {
  document: {
    getElementById: () => ({ addEventListener: () => {}, textContent: '', classList: { add: () => {}, remove: () => {} } }),
    querySelector: () => ({})
  },
  window: {},
  performance: { now: () => Date.now() },
  Image: class {}
};
dom.window = dom;

const ctx = vm.createContext(dom);
vm.runInContext(scriptMatch[1], ctx);

const P = dom.window.Prototype25D;
if (!P) throw new Error('Prototype25D not exposed on window');

console.log('Testing 3D stack physics...');
// 驗證 60 隻娃娃已生成
if (P.prizes.length < 50) throw new Error('Prize count is less than 50');

// 執行 120 步 3D 物理步進
for (let i = 0; i < 120; i++) P.step3DPhysics(0.016);

// 驗證無娃娃掉出邊界或穿透地面
for (const p of P.prizes) {
  if (p.y < p.r - 0.1) throw new Error(`Doll ${p.id} fell below floor: y=${p.y}`);
  if (Math.abs(p.x) > 75) throw new Error(`Doll ${p.id} breached X boundary: x=${p.x}`);
  if (Math.abs(p.z) > 55) throw new Error(`Doll ${p.id} breached Z boundary: z=${p.z}`);
}

console.log('✅ 3D Stack Physics Test Passed!');
```

- [x] **Step 2: 執行測試確認初始狀態失敗**

Run: `node scratch/test_25d_physics.js`
Expected: FAIL（因 `P.step3DPhysics` 尚未實作）

- [x] **Step 3: 於 `prototype_25d.html` 實作 3D 球體剛體碰撞與自然堆疊**

在 `prototype_25d.html` 中實作：
1. `initPrizes()`：生成 60 隻具備隨機微擾三維座標的娃娃。
2. `step3DPhysics(dt)`：
   - 重力加速度：$a_y = -380\text{px/s}^2$
   - 娃娃與地面/側壁碰撞：$y \ge r$，若落入出貨口 $x \le \text{CHUTE\_X} \land z \ge \text{CHUTE\_Z}$ 則允許自由墜落出貨。
   - 娃娃與娃娃之間的 3D 球體排斥：
     $$d = \sqrt{\Delta x^2 + \Delta y^2 + \Delta z^2}$$
     若 $d < r_A + r_B$，進行重疊位移分離與動量交換。
   - 開場預先模擬 180 步沉降，形成自然的有機立體山堆。

- [x] **Step 4: 重新執行測試驗證 3D 物理通過**

Run: `node scratch/test_25d_physics.js`
Expected: PASS（輸出 `✅ 3D Stack Physics Test Passed!`）

- [x] **Step 5: 提交 Commit**

```bash
git add prototype_25d.html scratch/test_25d_physics.js
git commit -m "feat(2.5d): implement 3D rigid-body stack physics and collision engine"
```

---

### Task 2: 高度自適應陰影投影與垂直光學瞄準 (Height-Adaptive Shadow Projection)

**Files:**
- Modify: `d:/GitHub/pixel-claw-machine/prototype_25d.html:560-640`
- Test: `scratch/test_25d_shadow.js`

**Interfaces:**
- Consumes: 天車世界座標 $(C_x, C_y, C_z)$，娃娃陣列 `prizes`
- Produces: `getUnderSurfaceHeight(cx, cz)` 回傳最高表面高度 $Y_{\text{surface}}$，並將陰影精確投射於該高度。

- [x] **Step 1: 編寫高度自適應陰影測試腳本**

```javascript
// scratch/test_25d_shadow.js
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('D:/GitHub/pixel-claw-machine/prototype_25d.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);

const dom = {
  document: { getElementById: () => ({ addEventListener: () => {}, textContent: '', classList: { add: () => {}, remove: () => {} } }), querySelector: () => ({}) },
  window: {},
  performance: { now: () => Date.now() },
  Image: class {}
};
dom.window = dom;
const ctx = vm.createContext(dom);
vm.runInContext(scriptMatch[1], ctx);

const P = dom.window.Prototype25D;
// 測試 1: 在空曠地面上方，陰影高度應為 0
const hEmpty = P.getUnderSurfaceHeight(70, -50);
if (hEmpty !== 0) throw new Error(`Expected floor height 0, got ${hEmpty}`);

// 測試 2: 在已知高度為 25 的娃娃正上方，陰影高度應為娃娃頂部 y + r
const target = P.prizes[0];
const hDoll = P.getUnderSurfaceHeight(target.x, target.z);
if (hDoll < target.y) throw new Error(`Expected shadow height >= ${target.y}, got ${hDoll}`);

console.log('✅ Height-Adaptive Shadow Projection Test Passed!');
```

- [x] **Step 2: 執行測試確認初始狀態失敗**

Run: `node scratch/test_25d_shadow.js`
Expected: FAIL（因 `P.getUnderSurfaceHeight` 尚未實作）

- [x] **Step 3: 實作 `getUnderSurfaceHeight(cx, cz)` 與動態陰影渲染**

1. 計算爪子覆蓋區域圓錐半徑 $R_{\text{aim}} = 12$。
2. 搜尋垂直投影範圍內最高物體表面 $Y_{\text{surface}} = \max_{p}(p.y + p.r)$。
3. 陰影貼合於 $\text{project}(C_x, Y_{\text{surface}}, C_z)$，陰影尺寸隨 $Y_{\text{surface}}$ 縮放。
4. 繪製由天車頂直通 $Y_{\text{surface}}$ 的垂直紅色雷射虛線。

- [x] **Step 4: 執行測試驗證通過**

Run: `node scratch/test_25d_shadow.js`
Expected: PASS（輸出 `✅ Height-Adaptive Shadow Projection Test Passed!`）

- [x] **Step 5: 提交 Commit**

```bash
git add prototype_25d.html scratch/test_25d_shadow.js
git commit -m "feat(2.5d): add height-adaptive shadow mapping and vertical optical aiming laser"
```

---

### Task 3: Neo-Arcade 8-Bit 立體街機框體美學渲染 (Arcade Housing & Aesthetics)

**Files:**
- Modify: `d:/GitHub/pixel-claw-machine/prototype_25d.html:510-580, 710-760`
- Test: Playwright 視覺快照

**Interfaces:**
- Consumes: Canvas 2D context，遊戲模式 `mode`，連擊狂熱狀態 `combo`
- Produces: 沉浸式街機框體（頂部霓虹跑馬燈、壓克力雙向反射、發光投幣面板、立體出貨斗槽）。

- [x] **Step 1: 實作雙層頂部霓虹招牌與 14 顆高頻跑馬燈泡**
- [x] **Step 2: 實作立體壓克力四壁金屬合金角柱與斜向眩光反射層**
- [x] **Step 3: 實作底部金屬操作面板、發光投幣孔與立體出貨槽**
- [x] **Step 4: 使用 Playwright 進行實機截圖檢視視覺品質**
- [x] **Step 5: 提交 Commit**

```bash
git add prototype_25d.html
git commit -m "feat(2.5d): render neo-arcade cabinet housing with marquee bulbs and acrylic reflections"
```

---

### Task 4: 8 種 2.5D 特色立體像素娃娃渲染 (Isometric Doll Art & Highlighting)

**Files:**
- Modify: `d:/GitHub/pixel-claw-machine/prototype_25d.html:280-330, 620-690`
- Test: `scratch/test_25d_dolls.js`

**Interfaces:**
- Consumes: `prizes` 娃娃列表
- Produces: 8 種特製娃娃立體渲染（小熊、兔兔、小雞、喵喵、青蛙、神秘寶箱、彩虹金幣福袋、金色招財貓王），具備立體球型高光、厚度與像素五官。

- [x] **Step 1: 編寫娃娃種類完整度測試腳本**

```javascript
// scratch/test_25d_dolls.js
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('D:/GitHub/pixel-claw-machine/prototype_25d.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);

const dom = {
  document: { getElementById: () => ({ addEventListener: () => {}, textContent: '', classList: { add: () => {}, remove: () => {} } }), querySelector: () => ({}) },
  window: {},
  performance: { now: () => Date.now() },
  Image: class {}
};
dom.window = dom;
const ctx = vm.createContext(dom);
vm.runInContext(scriptMatch[1], ctx);

const P = dom.window.Prototype25D;
const expectedIds = ['bear', 'bunny', 'chick', 'cat', 'frog', 'chest', 'money_bag', 'king'];
for (const id of expectedIds) {
  if (!P.DOLL_TYPES.some(t => t.id === id)) throw new Error(`Missing doll type: ${id}`);
}
console.log('✅ 8 2.5D Doll Types Complete!');
```

- [x] **Step 2: 執行測試確認初始狀態失敗（缺 `money_bag`）**
- [x] **Step 3: 於 `DOLL_TYPES` 中加入 `money_bag`（彩虹金幣福袋）並實作 8 種娃娃立體像素渲染**
- [x] **Step 4: 執行測試驗證通過**
- [x] **Step 5: 提交 Commit**

```bash
git add prototype_25d.html scratch/test_25d_dolls.js
git commit -m "feat(2.5d): implement 8 isometric doll types with 3D sphere highlights and pixel traits"
```

---

### Task 5: 完整遊戲循環系統 (Full Gameplay Loop, Coin, Pity, Shop, Dex & Early Close)

**Files:**
- Modify: `d:/GitHub/pixel-claw-machine/prototype_25d.html:70-220, 340-490`
- Test: `scratch/test_25d_loop.js`

**Interfaces:**
- Consumes: 使用者輸入、按鈕點擊
- Produces: 投幣（10元/次）、累積保夾條、二段提前合爪（`earlyClose`）、娃娃櫃圖鑑一鍵出售、RPG 機台升級商店、台主阿財吐槽對話與 FEVER TIME 連擊。

- [ ] **Step 1: 編寫完整遊戲循環測試腳本**

```javascript
// scratch/test_25d_loop.js
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('D:/GitHub/pixel-claw-machine/prototype_25d.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);

const dom = {
  document: {
    getElementById: () => ({ addEventListener: () => {}, textContent: '', classList: { add: () => {}, remove: () => {} }, style: {}, innerHTML: '' }),
    querySelector: () => ({})
  },
  window: {},
  localStorage: { getItem: () => null, setItem: () => {} },
  performance: { now: () => Date.now() },
  Image: class {}
};
dom.window = dom;
const ctx = vm.createContext(dom);
vm.runInContext(scriptMatch[1], ctx);

const P = dom.window.Prototype25D;

// 1. 投幣測試
P.insertCoin();
if (P.credits !== 1) throw new Error('Coin insert failed');

// 2. 開始回合
P.startRound();
if (P.mode !== 'move') throw new Error('Start round failed');

// 3. 二段合爪測試
P.triggerDrop();
if (P.mode !== 'down') throw new Error('Trigger drop failed');
P.triggerEarlyClose();
if (P.mode !== 'grab' && P.mode !== 'close') throw new Error('Early close failed');

// 4. 連擊狂熱測試
P.onWinPrize({ type: { id: 'bear', name: '小熊' } });
P.onWinPrize({ type: { id: 'bear', name: '小熊' } });
if (P.combo < 2) throw new Error('Fever combo failed');

console.log('✅ 2.5D Full Gameplay Loop Test Passed!');
```

- [ ] **Step 2: 執行測試確認初始狀態失敗**
- [ ] **Step 3: 實作投幣、保夾、二段合爪、圖鑑、商店與台主阿財對話**
- [ ] **Step 4: 執行測試驗證通過**
- [ ] **Step 5: 提交 Commit**

```bash
git add prototype_25d.html scratch/test_25d_loop.js
git commit -m "feat(2.5d): add full game loop with coins, pity, shop, dex, early close, and fever mode"
```

---

### Task 6: Playwright 瀏覽器實機端對端驗收與文件更新

**Files:**
- Modify: `SPEC.md`, `handoff.md`, `README.md`
- Test: Playwright E2E 測試

- [ ] **Step 1: 運行 Playwright 實機自動化操作驗收**
- [ ] **Step 2: 擷取 2.5D 進化版高解析畫面快照**
- [ ] **Step 3: 更新規格書與說明文件**
- [ ] **Step 4: 提交 Commit 並推播至 GitHub**

```bash
git add SPEC.md handoff.md README.md prototype_25d.html
git commit -m "chore(2.5d): update specs, handoff, and readme with complete 2.5D isometric game"
git push origin master
```
