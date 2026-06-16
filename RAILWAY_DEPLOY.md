# Deploy Mile High Games on Railway

One Railway service hosts **everything**: the website (React), REST API, and WebSockets (Socket.IO). Everyone plays at a single URL like `https://your-app.up.railway.app`.

This matches running locally:

```bash
npm run build --prefix client
npm run start --prefix server
```

The server serves `client/dist` and game logic on the same port.

---

## What you get

| Piece | How it runs on Railway |
|-------|-------------------------|
| Website (UI) | Built to `client/dist`, served by Express |
| Game API | `/api/games`, `/api/health`, etc. |
| Real-time play | Socket.IO on the same domain |
| Content (prompts/trivia) | Loaded from `content/` when the server starts |

Players only need **one link**. No separate client port (5173) in production.

---

## Before you deploy

### 1. Put the project on GitHub (recommended)

Railway works best with **Deploy from GitHub**.

If this folder is not a git repo yet:

```bash
cd "C:\Users\Sushant\Documents\friend games project"
git init
git add .
git commit -m "Initial commit for Railway deploy"
```

Create a new repository on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. Content is already included

Game prompts and trivia live in `content/`. They ship with the repo and load when the server starts. You do not need a separate content deploy step unless you change those files later.

---

## Railway setup (step by step)

### Step 1 — Create a Railway account and project

1. Go to [https://railway.app](https://railway.app) and sign in.
2. Click **New Project**.
3. Choose **Deploy from GitHub repo**.
4. Authorize GitHub if prompted and select your Mile High Games repository.
5. **Root directory:** leave as the **repo root** (not `client/` or `server/`).

### Step 2 — Configure build and start commands

Railway will not automatically build the React client. Open your service → **Settings** and set:

**Build command:**

```bash
npm install --prefix client && npm install --prefix server && npm run build --prefix client
```

**Start command:**

```bash
npm run start --prefix server
```

(Equivalent: `npm start` from the repo root if your root `package.json` already delegates to the server.)

### Step 3 — Generate a public URL

1. Open the service → **Settings** → **Networking** (or **Public Networking**).
2. Click **Generate Domain**.
3. Railway gives you something like `mile-high-games-production.up.railway.app`.
4. That URL is what you share with friends.

### Step 4 — Deploy

- **Automatic:** push to GitHub (`git push`) and Railway rebuilds.
- **Manual:** Railway dashboard → **Deploy** / **Redeploy**.

Wait until the deploy shows **Success** and the logs say the server is listening.

### Step 5 — Verify it works

Open in a browser:

| Check | URL |
|-------|-----|
| Game UI | `https://YOUR-DOMAIN.up.railway.app` |
| Health API | `https://YOUR-DOMAIN.up.railway.app/api/health` |

Health should return: `{"ok":true}`

### Step 6 — Play

1. One person opens the Railway URL and **creates a room** (host).
2. Share the room code or join link.
3. Everyone else opens the **same URL** on phone or laptop and joins.
4. Host picks a game and starts.

---

## Important settings and caveats

### Keep replicas at 1

Rooms are stored **in server memory**. In Railway service settings, use **one instance/replica** only. Multiple replicas would split players across different servers and break rooms.

### Restarts clear rooms

A redeploy or server restart wipes active rooms. Fine for casual friend sessions; just create a new room after a deploy.

### Free tier may sleep

On Railway’s free/hobby tiers, the service can sleep when idle. The first visit after sleep may take a few seconds to wake up. Paid plans avoid sleep.

### WebSockets

Railway supports WebSockets on HTTP services. No extra configuration is required for Socket.IO.

### No `VITE_SERVER_URL` needed

In production the client connects to `window.location.origin` (same URL as the page). You only need `VITE_SERVER_URL` if the frontend and backend are on **different domains** — not the case for this single-service deploy.

---

## Redeploy after code or content changes

1. Edit files locally (UI, server, or `content/` JSON).
2. Commit and push:

```bash
git add .
git commit -m "Update game content"
git push
```

3. Railway runs the build command and restarts automatically.

If you changed prompts via scripts locally:

```bash
python scripts/apply_llm_curation.py
git add content/
git commit -m "Curated content"
git push
```

---

## Optional — Deploy without GitHub (Railway CLI)

```bash
npm install -g @railway/cli
railway login
cd "C:\Users\Sushant\Documents\friend games project"
railway init
railway up
```

You still need to set the **same build and start commands** in the Railway dashboard and **Generate Domain** under Networking.

---

## Local vs Railway (quick reference)

| Mode | Command | URL |
|------|---------|-----|
| **Local dev** (coding) | `npm run dev` or `npm run restart` | Client: `http://localhost:5173`, Server: `http://localhost:3001` |
| **Local production** (LAN road trip) | `npm run build` then `npm start` | `http://localhost:3001` or `http://YOUR_LAN_IP:3001` |
| **Railway** | Automatic on push | `https://YOUR-DOMAIN.up.railway.app` |

---

## Troubleshooting

### “Client not built” or blank page

Build step failed or was skipped. Confirm the **build command** includes `npm run build --prefix client` and check deploy logs for errors.

### Cannot connect / socket errors

- Confirm the public domain is generated and the deploy is running.
- Open `/api/health` — if that fails, the server is not up.
- Ensure you are using `https://` (Railway’s default), not `http://`.

### Port / EADDRINUSE locally

On your machine only — stop other dev servers or run `npm run restart` once. Railway sets `PORT` for you; do not hardcode 3001 in production.

### Games work locally but not on Railway

- Redeploy after content changes (server reads JSON at startup).
- Check Railway **Deploy Logs** for startup errors.
- Run tests locally before push: `npm run test:games:7p` (with server running).

---

## Checklist

- [ ] Project pushed to GitHub
- [ ] Railway project linked to repo
- [ ] Build command set (client install + build, server install)
- [ ] Start command set (`npm run start --prefix server`)
- [ ] Public domain generated
- [ ] `/api/health` returns `ok: true`
- [ ] Host can create a room; players can join from phones
- [ ] Replicas = 1

---

## Commands cheat sheet

```bash
# Build + start locally (same as Railway production shape)
npm install --prefix client && npm install --prefix server && npm run build --prefix client
npm run start --prefix server

# Dev (two ports — not for friends joining)
npm run dev

# Test all games (server must be running)
npm run test:games:7p
```