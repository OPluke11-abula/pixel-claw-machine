const fs = require('fs');
const vm = require('vm');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'prototype_25d.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error('No script tag found in prototype_25d.html');

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

console.log('Testing 8 2.5D Doll Types Complete...');
const expectedIds = ['bear', 'bunny', 'chick', 'cat', 'frog', 'chest', 'money_bag', 'king'];

for (const id of expectedIds) {
  const doll = P.DOLL_TYPES.find(t => t.id === id);
  if (!doll) throw new Error(`Missing doll type: ${id}`);
  console.log(`- Found doll [${id}]: ${doll.name} (r=${doll.r}, weight=${doll.w}, price=${doll.price}🪙)`);
}

if (P.DOLL_TYPES.length !== 8) {
  throw new Error(`Expected exactly 8 doll types, got ${P.DOLL_TYPES.length}`);
}

console.log('✅ 8 2.5D Doll Types Complete!');
