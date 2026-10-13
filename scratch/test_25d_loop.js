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
      dataset: {},
      innerHTML: ''
    }),
    querySelectorAll: () => [],
    querySelector: () => null
  },
  window: {
    addEventListener: () => {},
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: (t) => clearTimeout(t)
  },
  setTimeout: (fn) => setTimeout(fn, 0),
  clearTimeout: (t) => clearTimeout(t),
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

console.log('Testing 2.5D Full Gameplay Loop...');

// 1. 投幣測試
const coinsBefore = P.save.coins;
P.insertCoin();
if (P.credits !== 1) throw new Error(`Coin insert failed: credits=${P.credits}`);
if (P.save.coins !== coinsBefore - 10) throw new Error(`Coin deduction failed: coins=${P.save.coins}`);
console.log(`- Coin inserted: coins=${P.save.coins}, credits=${P.credits}, pity=${P.save.pity}`);

// 2. 開始回合
P.startRound();
if (P.mode !== 'move') throw new Error(`Start round failed: mode=${P.mode}`);
console.log(`- Round started: mode=${P.mode}`);

// 3. 二段合爪測試
P.triggerDrop();
if (P.mode !== 'down') throw new Error(`Trigger drop failed: mode=${P.mode}`);
P.triggerEarlyClose();
if (P.mode !== 'grab' && P.mode !== 'close') throw new Error(`Early close failed: mode=${P.mode}`);
console.log(`- Early close executed: mode=${P.mode}`);

// 4. 連擊狂熱測試
P.onWinPrize({ type: { id: 'bear', name: '小熊', price: 25 } });
P.onWinPrize({ type: { id: 'bear', name: '小熊', price: 25 } });
if (P.combo < 2) throw new Error(`Fever combo failed: combo=${P.combo}`);
console.log(`- Fever combo achieved: combo=${P.combo}`);

console.log('✅ 2.5D Full Gameplay Loop Test Passed!');
