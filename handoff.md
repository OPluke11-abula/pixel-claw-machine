# Pixel Claw Machine - 專案交接與工程規格說明書 (Handoff Document v2.0)

本文件專為專案工程維護、作業審查與後續 AI Agent 協作提供完整的架構說明、核心演算法細節與數值對照。

---

## 📌 1. 專案概述 (Project Overview)
- **專案名稱**：PIXEL CLAW 像素夾娃娃機 (v2.0)
- **架構特點**：
  - **單一檔案 (Zero-Dependency)**：完全整合於 `index.html`，純原生 HTML5 + CSS3 + ES6 JavaScript + Web Audio API。
  - **自研 2D 物理引擎**：無依賴 Matter.js 或 Box2D，純原生寫成，包含剛體圓形碰撞、膠囊體線段推擠、連續碰撞防穿透、單擺慣性模擬與時間縮放。
  - **RPG 機台養成與經濟循環**：將傳統夾娃娃機結合 RPG 機台改裝升級（6 大維度）、單局增益道具與圖鑑金幣循環。

---

## 🔬 2. 核心演算法與數學模型

### 2.1 爪子動態幾何與等比例縮放 (`clawGeom`)
底層傳說娃娃半徑高達 $r = 16\sim 17$，為標準娃娃（$r = 8$）的 2 倍以上，像素體積達 4 倍。
未升級「巨型爪」前，爪臂閉合半徑不足以包裹大娃娃重心，會直接頂到娃娃頂部滑開。
- **縮放因子**：
  $$S = 1 + \text{save.upgrades.size} \times 0.20 \quad (\text{Lv.0}=1.0, \text{Lv.1}=1.2, \text{Lv.2}=1.4, \text{Lv.3}=1.6)$$
- **爪臂膠囊體座標變換**：
  爪臂局部座標點 $(l_x, l_y)$ 映射至畫布世界座標 $(W_x, W_y)$：
  $$\begin{cases}
  W_x = h_x + (l_x \cos\theta + l_y \sin\theta) \times S \\
  W_y = h_y - (l_x \sin\theta - l_y \cos\theta) \times S
  \end{cases}$$
  使得爪子的外觀繪製（Canvas Draw）與物理膠囊推擠判定（`segPush`）完全嚴格同步放大。

### 2.2 夾持品質與抓取命運演算法 (`decideFate`)
- **基礎爪力**：$\text{baseStr} \in [0.20, 0.50]$，受馬達等級強化：
  $$\text{strength} = \text{baseStr} \times (1 + \text{save.upgrades.str} \times 0.20)$$
  若當局啟用了「強爪藥水」或進入「保夾中」，則 $\text{strength} = 1.0$。
- **對心與擺動因子**：
  $$\text{center} = \text{clamp}(1 - |l_x| / 11, 0, 1), \quad \text{swing} = \text{clamp}(1 - |\omega| \times 0.25, 0.6, 1)$$
- **綜合抓取品質**：
  $$Q = \frac{\text{strength} \times (0.4 + 0.6 \times \text{center}) \times \text{swing}}{w_{\text{doll}}}$$
- **最終勝率計算**：
  $$\text{Chance} = \text{clamp}((Q - 0.18) \times 1.6, 0, 0.65)$$
  若隨機數大於勝率，則隨機分配在上升中（40%）、最高點（25%）或回程中（35%）觸發物理鬆脫。

### 2.3 氣球浮力微調模型
氣球娃（`balloon`）具備垂直浮力調節器，避免傳統浮力持續上升貼死天花板導致爪子抓不到：
- 目標懸停高度：$Y_{\text{target}} = 220$（緊鄰娃娃堆表層上空）
- 浮力加速度：
  $$a_y = \begin{cases} -g \times 0.35 & (y > Y_{\text{target}}) \\ +g \times 0.25 & (y \le Y_{\text{target}}) \end{cases}$$
- 配合垂直阻尼 $v_y \times (1 - 1.5 \Delta t)$ 與硬天花板保護（$y \ge 185$），呈現自然輕柔漂浮，且夾爪必定能觸及並抓取。

### 2.4 擋板防溢出與物理重整保護
壓克力擋板頂部高度為 $Y = 317$（高 $105\text{px}$）。
為防止 95 隻娃娃在重整與開場預先落定時自發滾入出貨洞口：
1. 擋板頂部配置雙向段推擠幾何：垂直擋板線段 `(BARRIER_X, BARRIER_TOP) -> (BARRIER_X, FLOOR+30)` 加上水平防翻倒鉤 `(BARRIER_X, BARRIER_TOP) -> (BARRIER_X+6, BARRIER_TOP)`。
2. 重整 (`refillMachine`) 執行期間將 `booted = false`，並對 $X < \text{BARRIER\_X}$ 區域施加暫時邊界鎖定，待 600 步物理沉降完畢且速度歸零後，才將 `booted = true`，確保開場與重整 0 漏球。

---

## 🕹️ 3. 模組與核心函式對照表

| 函式名稱 | 作用說明 | 關鍵關聯變數 / 邏輯 |
|---|---|---|
| `clawGeom()` | 計算爪子關節點世界座標與局部逆轉換 | 依據 `upgrades.size` 計算縮放因子 $S$ |
| `decideFate(p, lx)` | 決定該次抓取是成功持握或是半空脫落 | 依據重量、爪力、偏心率與升級加成計算機率 |
| `refillMachine(themeId, isManual)` | 重新填充機台內 95 隻娃娃並沉降 | 分為底 (20)、中 (35)、頂 (40) 三層，冷卻 180s |
| `changeTheme(themeId)` | 切換 4 大主題機台 | 刷新主題娃娃池與 `save.theme` |
| `toggleSpeed()` | 切換 1X / 2X 倍速 | 改變 `timeScale`，調整 `acc += dt * timeScale` |
| `openDex()` / `openShop()` | 開啟圖鑑櫃與 RPG 商店視窗 | 一鍵出售重複娃娃、升級 6 大改裝與購買道具 |
| `updateUI()` | 畫面所有數據、按鈕狀態與冷卻即時刷新 | 每秒循環一次以驅動重整按鈕即時倒數計時 |

---

## 📦 4. 本地儲存結構 (`localStorage`)

```json
{
  "spent": 0,
  "plays": 0,
  "wins": 0,
  "pity": 0,
  "armed": false,
  "streak": 0,
  "coll": { "bear": 1, "lucky": 1 },
  "ach": { "first": 1728800000000 },
  "muted": false,
  "visited": true,
  "tokens": 250,
  "buffs": { "strong": false, "radar": false, "magnet": false },
  "upgrades": {
    "rope": 0,
    "str": 0,
    "time": 0,
    "speed": 0,
    "size": 0,
    "luck": 0
  },
  "theme": "animal",
  "lastRefill": 1728801200000
}
```

---

## 🚀 5. 測試驗證紀錄 (Playwright E2E)
- **Node.js 語法檢驗**：`new Function(script)` 驗證 0 錯誤。
- **Playwright 瀏覽器實機測試**：
  - 成功切換 2X 倍速（按鈕即時變為 `⏩ 2X` 且高亮綠色，下爪速度明顯加倍）。
  - 成功切換至「⚙️ 鋼鐵機械機」，確認場上生成 95 隻機械娃娃（包含鋼鐵巨神、重力磚塊等）。
  - 成功執行重整按鈕，觸發 180 秒冷卻倒數，畫面即時倒數至 `0:00` 前無法重複點擊。
  - 完整投幣、移動、下爪、抓取、回程結算無任何 JavaScript Exception。
