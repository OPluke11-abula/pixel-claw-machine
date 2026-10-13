const fs = require('fs');
const vm = require('vm');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'prototype_25d.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error('No script tag found in prototype_25d.html');

// 模擬完整的 DOM 與 Canvas 環境
const dom = {
  document: {
    getElementById: (id) => ({
      id,
      addEventListener: () => {},
      getContext: () => ({
        clearRect: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        moveTo: () => {},
        lineTo: () => {},
        fillText: () => {},
        strokeRect: () => {},
        fillRect: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        scale: () => {},
        createRadialGradient: () => ({ addColorStop: () => {} }),
        createLinearGradient: () => ({ addColorStop: () => {} }),
        setLineDash: () => {}
      }),
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 440, height: 600 }),
      textContent: '',
      style: {},
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      children: [],
      dataset: {}
    }),
    querySelectorAll: () => [],
    querySelector: () => null
  },
  window: {
    addEventListener: () => {}
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  performance: { now: () => Date.now() },
  requestAnimationFrame: () => {},
  Image: class {}
};
dom.window.window = dom.window;
dom.window.document = dom.document;
dom.window.localStorage = dom.localStorage;
dom.window.performance = dom.performance;
dom.window.requestAnimationFrame = dom.requestAnimationFrame;

const ctx = vm.createContext(dom.window);
vm.runInContext(scriptMatch[1], ctx);

const P = dom.window.Prototype25D;
if (!P) throw new Error('Prototype25D not exposed on window');

console.log('Testing 3D stack physics...');
// 驗證 60 隻娃娃已生成
if (P.prizes.length < 50) throw new Error(`Prize count is less than 50: ${P.prizes.length}`);

// 執行 120 步 3D 物理步進
for (let i = 0; i < 120; i++) P.step3DPhysics(0.016);

// 驗證無娃娃掉出邊界或穿透地面
for (const p of P.prizes) {
  if (p.y < p.r - 0.5) throw new Error(`Doll ${p.id} fell below floor: y=${p.y}, r=${p.r}`);
  if (Math.abs(p.x) > 76) throw new Error(`Doll ${p.id} breached X boundary: x=${p.x}`);
  if (Math.abs(p.z) > 56) throw new Error(`Doll ${p.id} breached Z boundary: z=${p.z}`);
}

console.log(`✅ 3D Stack Physics Test Passed! (${P.prizes.length} dolls simulated)`);
