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

### 2.4 擋板防溢出與多機台持久化防洗機制 (Anti-Exploit & Machine Persistence)
壓克力擋板頂部高度為 $Y = 207$（加高至 $215\text{px}$，完整阻隔高達 95 隻的飽滿娃娃堆峰頂）。
為防止 95 隻娃娃在重整與切換機台時自發滾入出貨洞口，並杜絕切換主題卡 bug 無限重整洗娃娃：
1. **多機台獨立狀態持久化 (`save.machines[themeId]`)**：各主題機台獨立記錄場上娃娃座標與圖鑑，切換主題時只載入既有殘局，絕不重新生成 95 隻新娃娃；唯有透過「重整機台」按鈕並消耗 3 分鐘全局冷卻時才允許補滿。
2. **閒置出貨絕對防禦**：`collect(p)` 嚴格防護 `if (!booted || mode === 'idle' || !round) return;`，在非遊戲操作狀態下任何娃娃入洞均不觸發中獎與成就，徹底消除切換地圖贈獎 bug。
3. **擋板頂部雙向段推擠幾何**：垂直擋板線段 `(BARRIER_X, BARRIER_TOP) -> (BARRIER_X, FLOOR+30)` 加上水平防翻倒鉤 `(BARRIER_X, BARRIER_TOP) -> (BARRIER_X+6, BARRIER_TOP)`。
4. **氣球動態邊界防護**：未被夾取且未出貨的漂浮氣球限制於 $X \ge \text{BARRIER\_X} + r$，避免浮空橫移飄越擋板上方空域；當被夾爪成功運送並釋放至洞口時，解除浮力並施加重力正常掉入出貨口判定。
5. **重整物理沉降過濾**：重整 (`refillMachine`) 生成時將娃娃高度控制於 $Y \ge FLOOR - 190$（擋板頂部 $Y = 207$ 之下），執行 600 步物理沉降並進行邊界過濾，確保開場與重整 0 漏球。

### 2.5 打擊感與視覺反饋 (Juiciness & Audio Polish)
1. **螢幕微震 (Screen Shake)**：炸彈引爆或怪手抓取時觸發 `screenShake = 6`，在 `render()` 繪圖循環中對畫布上下文應用隨機像素偏移 `ctx.translate(rand(-sx, sx), rand(-sy, sy))`，配合線性阻尼衰減，創造強烈打擊反饋。
2. **Web Audio 合成音效擴充**：新增 `Sfx.excavator()`（重工業油壓活塞 Sawtooth+Square 低頻衝擊）、`Sfx.boom()`（鋸齒波+方波快速雙重降頻爆炸聲）、`Sfx.speed()`（倍速升降音階）、`Sfx.click()`（按鍵微觸覺高頻音）。
3. **光學雷達垂直瞄準線**：啟動雷達時自天車中心向地面繪製半透明紅色虛線雷射投影，提供精確下爪視覺輔助。
4. **神爪金光粒子**：保夾或強爪狀態下，爪臂隨機噴發金色或青色火花粒子。

### 2.6 巨型怪手鏟與多目標批次抓取機制 (Excavator Mega Scoop)
當玩家夾出「神秘寶箱 (`chest`)」或在商店購買「怪手改造卷」時，將獲得傳說能力 `save.buffs.excavator = true`：
1. **怪手形態幾何 (`clawGeom` isExcavator)**：
   - 挖斗寬度達 $56\text{px}$（標準爪臂的 $2.5$ 倍），天車雙重鋼索、油壓頂針基座、黑黃斑馬紋防護罩與旋轉工程警示燈。
   - 抓斗閉合時，合金鋼爪齒由兩側向中心閉合，形成完整物理包覆弧形斗。
2. **範圍多目標偵測 (`findExcavatorTargets`)**：
   - 於挖斗局部座標系偵測 $|l_x| < 28\text{px}$ 且 $l_y \in (0, 46\text{px})$ 內的所有娃娃，最多同時鏟入 7 隻娃娃入斗 (`claw.heldList = [...]`)。
   - 為每隻被鏟起的娃娃計算斗內局部散佈偏移量 (`p.localOffX, p.localOffY`)，在天車平移回程時同步計算世界座標與剛體速度向量，平滑攜帶。
3. **運送牢固與多目標連續釋放 (`release`)**：
   - 怪手命運鎖定為 `round.fate = { hold: true }`，運送途中絕不脫落。
   - 回到出貨洞口上方時，挖斗打開，`claw.heldList` 內的所有娃娃施加階梯微延遲加速度自然掉入洞口，連續觸發多次 `collect(p)`，實現滿載而歸的極致爽感！

### 2.7 二段提前合爪、FEVER 狂熱與彩虹金幣福袋
1. **二段提前合爪 (`earlyCloseRequested`)**：
   - 消除傳統夾娃娃機「下爪後只能被動等待到底」的枯燥感。在 `down` 模式期間，按鍵即時切換為「🛑 合爪」。
   - 再次按下 `Space` 或點擊按鈕即時標記 `earlyCloseRequested = true`，於半空中立即觸發 `findTarget(geom)` 與閉合夾取，使玩家能主動抓取浮空漂浮氣球、高層立體耳朵或半山腰的娃娃。
2. **FEVER TIME 連擊狂熱模式 (`save.combo`)**：
   - 連續獲勝（`save.combo >= 2`）時啟動狂熱模式：招牌燈泡以 2 倍速進行 6 色彩虹旋轉，頂部招牌閃爍 `FEVER xN`，機台狀態顯示狂熱徽章。
   - 狂熱狀態下每夾進一隻娃娃，額外加贈 `Math.min(100, save.combo * 25)` 金幣，極大提高爽快感與連莊刺激感。若未得獎則連擊歸零。
3. **彩虹金幣福袋 (`money_bag`)**：
   - 中層特製 8-bit 福袋娃娃（$r=11, w=1.5$），每台保證生成 2 隻。
   - 夾出入洞立即引爆金幣大獎（+160~260 🪙 金幣），解鎖「福袋大富翁」成就並噴射大量金幣煙火粒子。

---

## 🕹️ 3. 模組與核心函式對照表

| 函式名稱 | 作用說明 | 關鍵關聯變數 / 邏輯 |
|---|---|---|
| `clawGeom()` | 計算爪子關節點世界座標與局部逆轉換 | 支援標準爪縮放與 `isExcavator` 巨型挖斗幾何 |
| `findExcavatorTargets(geom)` | 搜尋怪手挖斗空間內重疊的多隻娃娃 | 一次判定多達 7 隻娃娃裝入 `claw.heldList` |
| `decideFate(p, lx)` | 決定該次抓取是成功持握或是半空脫落 | 依據重量、爪力、偏心率與升級加成計算機率 |
| `requestDrop()` | 處理出爪與二段合爪請求 | `move` 觸發下爪，`down` 觸發 `earlyCloseRequested` |
| `refillMachine(themeId, isManual)` | 重新填充機台內 95 隻娃娃並沉降 | 分為底 (20)、中 (35，含神秘寶箱與福袋)、頂 (40) 三層，冷卻 180s |
| `changeTheme(themeId)` | 切換 4 大主題機台 | 獨立存檔防洗 bug，切換主題維持殘局現狀 |
| `toggleSpeed()` | 切換 1X / 2X 倍速 | 改變 `timeScale`，調整 `acc += dt * timeScale` |
| `openDex()` / `openShop()` | 開啟圖鑑櫃與 RPG 商店視窗 | 一鍵出售重複娃娃、升級 6 大改裝、購買怪手卷與道具 |
| `updateUI()` | 畫面所有數據、按鈕狀態與冷卻即時刷新 | 每秒循環一次以驅動重整按鈕即時倒數計時與狀態徽章 |

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
  "combo": 0,
  "coll": { "bear": 1, "lucky": 1, "money_bag": 1 },
  "ach": { "first": 1728800000000, "fever_master": 1728800050000 },
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
- **Node.js 語法檢驗**：`vm.Script` 語法測試雙版本（`index.html` 與 `prototype_25d.html`）100% 通過。
- **Playwright 瀏覽器實機測試**：
  - 驗證二段按鍵提前合爪：下爪中按鈕切換為 `🛑 合爪`，點擊即時合爪閉合並標記 `⚡二段合爪!`。
  - 驗證彩虹金幣福袋爆獎：夾出福袋獲得 +213 🪙 金幣，並解鎖 `lucky_bag` 成就。
  - 驗證 FEVER TIME 連擊模式：連中 2 輪啟動彩虹跑馬燈、HUD 徽章，後續得獎額外獲得狂熱加成金幣。
  - 驗證失誤連擊重置：連續得獎中斷時 `save.combo` 安全歸零。
  - 驗證 2X 倍速與機台切換：全流程 0 JavaScript Exception。

---

## 🏗️ 6. 2.5D 等角透視立體娃娃機架構 (`prototype_25d.html`)

### 6.1 等角投影與動態高度投影
- **世界座標至螢幕座標**：
  $$\begin{cases}
  SX = \text{ORIGIN\_X} + (X - Z) \times \cos(30^\circ) \times \text{scale} + \text{panX} \\
  SY = \text{ORIGIN\_Y} + (X + Z) \times \sin(30^\circ) \times \text{scale} - Y \times \text{scale} + \text{panY}
  \end{cases}$$
- **高度自適應投影 (`getUnderSurfaceHeight`)**：
  夾爪下方垂直射線穿透計算，找出最高的球體表面切點高度 $Y_{\text{surf}}$，陰影直接渲染於娃娃表面，半徑隨爪頂至表面的相對距離平滑衰減，搭配垂直紅色虛線雷射與雙同心圓金色十字準心。

### 6.2 3D 剛體碰撞引擎實作 (`step3DPhysics`)
- 60 隻球體立體推疊，採位置修正衝量積分法，穿透量等分分配，反彈係數 $e = 0.25$，地面與球際摩擦阻尼 $\mu = 0.88$。
- 出貨口沉箱防墜：底層壓克力圍欄高度 $Y = 36$，非下墜抓取狀態下的娃娃無法越過圍欄進入出貨口。

### 6.3 E2E 瀏覽器驗證結果
- **Playwright 實機巡檢**：
  - 投幣扣款與保夾累積（10🪙 / 次，300🪙 保夾）：100% 正常。
  - 瞄準與高度自適應陰影：陰影隨娃娃高度自動爬升至頂部，零深度視差。
  - 下爪與二段合爪：下降中點擊「🛑 提前合爪」即時轉換為合爪狀態，並彈出「⚡二段合爪!」飄字。
  - 抓取、回程、出貨口釋放與金幣獎勵：完整貫通。
  - 圖鑑出售重複娃娃：點擊「一鍵出售重複娃」正確扣除重複隻數並增發金幣。
  - 商店機台改裝：升級「巨型爪」扣款並成功晉級 Lv.1。
  - 霓虹跑馬燈與台詞系統：14 顆頂部燈泡動態跑馬燈、阿財即時台詞切換無任何報錯。

