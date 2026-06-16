import puppeteer from 'puppeteer';

const BASE = 'http://localhost:3001';
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 60000, args: ['--no-sandbox'] });
const host = await browser.newPage();
host.setDefaultTimeout(20000);

console.log('goto');
await host.goto(BASE, { waitUntil: 'load' });
await new Promise((r) => setTimeout(r, 2000));

console.log('wait connected');
await host.waitForSelector('[data-testid="socket-connected"]');

console.log('host');
await host.click('[data-testid="host-game-btn"]');
await host.waitForSelector('[data-testid="room-code"]');

console.log('code el');
const codeEl = await host.$('[data-testid="room-code"]');
const code = await codeEl?.evaluate((e) => e.textContent?.trim());
console.log('code', code);

console.log('done');
await browser.close();