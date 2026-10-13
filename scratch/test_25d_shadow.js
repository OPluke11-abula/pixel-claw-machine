const fs = require('fs');
const vm = require('vm');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'prototype_25d.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error('No script tag found');

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

console.log('Testing Height-Adaptive Shadow Projection...');

// 測試 1: 在空曠的出貨口角落 (-65, 45)，陰影高度應為 0 (地板表面)
const hEmpty = P.getUnderSurfaceHeight(-65, 45);
console.log(`Surface height at empty chute corner (-65, 45): ${hEmpty}`);
if (hEmpty !== 0) throw new Error(`Expected floor height 0, got ${hEmpty}`);

// 測試 2: 在娃娃堆正上方，陰影高度應自適應抬升至娃娃表面 (>= target.y)
const target = P.prizes[0];
const hDoll = P.getUnderSurfaceHeight(target.x, target.z);
console.log(`Surface height directly above doll ${target.type.name} at (${target.x.toFixed(1)}, ${target.z.toFixed(1)}): ${hDoll} (doll y=${target.y.toFixed(1)}, r=${target.r})`);
if (hDoll < target.y) throw new Error(`Expected shadow height >= ${target.y}, got ${hDoll}`);

console.log('✅ Height-Adaptive Shadow Projection Test Passed!');
