/**
 * Chrome E2E: host + minPlayers for every enabled game.
 * Uses separate browser instances for host vs players (avoids CDP timeouts).
 */
import puppeteer from 'puppeteer';
import fs from 'fs';

const API = process.env.SERVER_URL || 'http://localhost:3001';
const BASE = process.env.CLIENT_URL || 'http://localhost:5173';
const LOG = process.env.E2E_LOG || 'chrome-e2e-log.txt';
const STEP_MS = 25000;

function log(msg) {
  console.log(msg);
  fs.appendFileSync(LOG, msg + '\n');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const LAUNCH = {
  headless: true,
  protocolTimeout: 120000,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
};

async function newBrowserPage() {
  const browser = await puppeteer.launch(LAUNCH);
  const page = await browser.newPage();
  page.setDefaultTimeout(STEP_MS);
  return { browser, page };
}

async function waitConnected(page) {
  await page.waitForSelector('[data-testid="socket-connected"]', { timeout: STEP_MS });
}

async function playerSubmit(p) {
  if (await p.$('[data-testid="submitted-waiting"]')) return;
  await sleep(500);
  const sels = [
    '[data-testid="answer-TRUE"]',
    '[data-testid="answer-LIE"]',
    'button[data-testid^="answer-option-"]',
    '[data-testid="lie-for-me-btn"]',
    '[data-testid="submit-drawing-btn"]',
  ];
  for (const sel of sels) {
    const el = await p.$(sel);
    if (el) { await el.click(); return; }
  }
  if (await p.$('[data-testid="fibbage-input"]')) {
    await p.type('[data-testid="fibbage-input"]', 'junk e2e lie');
    await p.click('[data-testid="submit-answer-btn"]');
    return;
  }
  if (await p.$('[data-testid="text-answer-input"]')) {
    await p.type('[data-testid="text-answer-input"]', 'junk e2e answer');
    await p.click('[data-testid="submit-answer-btn"]');
    return;
  }
  if (await p.$('[data-testid="hidden-task-input"]')) {
    await p.type('[data-testid="hidden-task-input"]', 'junk e2e answer');
    await p.click('[data-testid="submit-answer-btn"]');
    return;
  }
  if (await p.$('[data-testid="rank-sort-input"]')) {
    await p.type('[data-testid="rank-sort-input"]', 'A, B, C');
    await p.click('[data-testid="submit-answer-btn"]');
    return;
  }
  const rankInput = await p.$('input:not([placeholder="Your name"])');
  if (rankInput) {
    await rankInput.type('A, B, C');
    await p.click('[data-testid="submit-answer-btn"]');
    return;
  }
  const area = await p.$('textarea');
  if (area) {
    await area.type('junk e2e answer');
    const btn = await p.$('[data-testid="submit-answer-btn"]');
    if (btn) await btn.click();
  }
}

async function advanceHost(host) {
  for (let i = 0; i < 12; i++) {
    const phase = await host.$eval('[data-testid="host-game-phase"]', (e) => e.getAttribute('data-phase') || '').catch(() => '');
    if (['results', 'reveal', 'vote'].includes(phase)) return phase;
    const skip = await host.$('[data-testid="skip-phase-btn"]');
    if (skip) await skip.click();
    await sleep(800);
  }
  return await host.$eval('[data-testid="host-game-phase"]', (e) => e.getAttribute('data-phase') || '').catch(() => '');
}

async function playerVote(p) {
  await sleep(300);
  const vote = await p.$('[data-testid^="vote-"]');
  if (vote) { await vote.click(); return; }
  const pair = await p.$('[data-testid="vote-pair-a"]');
  if (pair) await pair.click();
}

async function playGame(game) {
  const n = Math.min(Math.max(game.minPlayers, 1), 7);
  const hostCtx = await newBrowserPage();
  const playerCtxs = [];
  for (let i = 0; i < n; i++) playerCtxs.push(await newBrowserPage());

  try {
    const { page: host } = hostCtx;
    await host.goto(BASE, { waitUntil: 'load', timeout: STEP_MS });
    await sleep(1000);
    await waitConnected(host);
    await host.click('[data-testid="host-game-btn"]');
    await host.waitForSelector('[data-testid="room-code"]', { timeout: STEP_MS });
    const code = await host.$eval('[data-testid="room-code"]', (e) => e.textContent?.trim() || '');

    for (let i = 0; i < playerCtxs.length; i++) {
      const { page: p } = playerCtxs[i];
      await p.goto(`${BASE}/?code=${code}`, { waitUntil: 'load', timeout: STEP_MS });
      await sleep(800);
      await waitConnected(p);
      await p.type('input[placeholder="Your name"]', `P${i + 1}`, { delay: 10 });
      await p.click('[data-testid="join-room-btn"]');
      await p.waitForSelector('[data-testid="room-page"]', { timeout: STEP_MS });
    }

    await host.click(`[data-testid="game-tile-${game.id}"]`);
    for (let i = 0; i < 50; i++) {
      const disabled = await host.$eval('[data-testid="start-game-btn"]', (e) => e.disabled).catch(() => true);
      if (!disabled) break;
      await sleep(400);
    }
    await host.click('[data-testid="start-game-btn"]');
    await host.waitForSelector('[data-testid="skip-phase-btn"]', { timeout: STEP_MS });
    await host.click('[data-testid="skip-phase-btn"]');

    await host.waitForSelector('[data-testid="host-game-phase"]', { timeout: STEP_MS });

    for (const { page: p } of playerCtxs) {
      try {
        await p.waitForFunction(
          () => {
            const sels = [
              '[data-testid="answer-TRUE"]',
              '[data-testid="submit-answer-btn"]',
              '[data-testid="submit-drawing-btn"]',
              'button[data-testid^="answer-option-"]',
              '[data-testid="lie-for-me-btn"]',
              'textarea',
              'input:not([placeholder="Your name"])',
              '[data-testid="submitted-waiting"]',
            ];
            return sels.some((s) => document.querySelector(s));
          },
          { timeout: 18000 },
        );
      } catch { /* spectator */ }
      await playerSubmit(p);
    }

    let finalPhase = await advanceHost(host);
    if (finalPhase === 'vote') {
      for (const { page: p } of playerCtxs) {
        try {
          await p.waitForSelector('[data-testid^="vote-"], [data-testid="vote-pair-a"]', { timeout: 8000 });
          await playerVote(p);
        } catch { /* no vote */ }
      }
      finalPhase = await advanceHost(host);
    }
    if (!['results', 'reveal', 'vote'].includes(finalPhase)) {
      throw new Error(`Stuck in phase "${finalPhase}"`);
    }

    log(`PASS  ${game.title} (${n}p)`);
    return { ok: true };
  } catch (err) {
    log(`FAIL  ${game.title}: ${err.message}`);
    return { ok: false, error: err.message };
  } finally {
    await hostCtx.browser.close().catch(() => {});
    for (const ctx of playerCtxs) await ctx.browser.close().catch(() => {});
  }
}

async function main() {
  if (fs.existsSync(LOG)) fs.unlinkSync(LOG);
  const health = await fetch(`${API}/api/health`).catch(() => null);
  if (!health?.ok) throw new Error(`Server not ready at ${API}`);
  let games = await (await fetch(`${API}/api/games`)).json();
  const limit = Number(process.env.GAME_LIMIT || 0);
  if (limit > 0) games = games.slice(0, limit);
  log(`Chrome E2E: ${games.length} games @ ${BASE}`);

  const results = [];
  for (const g of games) {
    results.push(await playGame(g));
    await sleep(400);
  }

  const passed = results.filter((r) => r.ok).length;
  log(`${passed}/${games.length} passed`);
  process.exit(passed < games.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});