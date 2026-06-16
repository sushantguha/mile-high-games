import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ headless: true, protocolTimeout: 60000, args: ['--no-sandbox'] });
const host = await b.newPage();
const player = await b.newPage();

await host.goto('http://localhost:5173', { waitUntil: 'load', timeout: 20000 });
await host.waitForSelector('[data-testid="socket-connected"]', { timeout: 20000 });
await host.click('[data-testid="host-game-btn"]');
await host.waitForSelector('[data-testid="room-code"]', { timeout: 20000 });
const code = await host.$eval('[data-testid="room-code"]', (e) => e.textContent?.trim());
console.log('room', code);

await player.goto(`http://localhost:5173/?code=${code}`, { waitUntil: 'load', timeout: 20000 });
await player.waitForSelector('[data-testid="socket-connected"]', { timeout: 20000 });
await player.type('input[placeholder="Your name"]', 'P1');
await player.click('[data-testid="join-room-btn"]');
await player.waitForSelector('[data-testid="room-page"]', { timeout: 20000 });
console.log('player joined');

await host.click('[data-testid="game-tile-lie-swatter"]');
await host.waitForSelector('[data-testid="start-game-btn"]:not([disabled])', { timeout: 20000 });
await host.click('[data-testid="start-game-btn"]');
await host.waitForSelector('[data-testid="skip-phase-btn"]', { timeout: 20000 });
await host.click('[data-testid="skip-phase-btn"]');
console.log('game started');

await player.waitForSelector('[data-testid="answer-TRUE"]', { timeout: 20000 });
await player.click('[data-testid="answer-TRUE"]');
await host.waitForSelector('[data-testid="phase-label"]', { timeout: 20000 });
console.log('PASS lie-swatter full flow');

await b.close();