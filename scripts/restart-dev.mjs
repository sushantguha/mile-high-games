/**
 * Kill anything on ports 3001/5173 then start npm run dev (Windows-friendly).
 */
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const isWin = process.platform === 'win32';

function killPorts() {
  if (isWin) {
    try {
      execSync(
        'powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3001,5173 -ErrorAction SilentlyContinue | ForEach-Object { if ($_.OwningProcess -gt 0) { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"',
        { stdio: 'ignore' },
      );
    } catch { /* ports already free */ }
  } else {
    for (const port of [3001, 5173]) {
      try {
        execSync(`fuser -k ${port}/tcp 2>/dev/null || lsof -ti:${port} | xargs kill -9 2>/dev/null`, {
          shell: true,
          stdio: 'ignore',
        });
      } catch { /* ignore */ }
    }
  }
}

killPorts();
console.log('Starting dev (client :5173 + server :3001)...');
const child = spawn(isWin ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: root,
  stdio: 'inherit',
  shell: isWin,
});
child.on('exit', (code) => process.exit(code ?? 0));