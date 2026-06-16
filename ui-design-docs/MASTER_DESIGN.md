# Mile High Games — Master UI Design Document

> **Design stance:** Jackbox-*inspired*, not Jackbox-copied. We borrow the *feel* — theatrical host screens, phone-as-controller simplicity, bold per-game art direction, saturated palettes, and TV-show pacing — while building original typography, patterns, hosts, and motion language for Mile High Games.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Global Design Tokens](#2-global-design-tokens)
3. [Page Specifications](#3-page-specifications)
4. [Phase System (Host + Client)](#4-phase-system-host--client)
5. [Archetype UI Patterns](#5-archetype-ui-patterns)
6. [Sound Design (Host Only)](#6-sound-design-host-only)
7. [Animation Library](#7-animation-library)
8. [Accessibility & Responsive Rules](#8-accessibility--responsive-rules)
9. [Per-Game Documentation Index](#9-per-game-documentation-index)

---

## 1. Design Philosophy

### 1.1 The Jackbox Lessons (Adapted for Mile High Games)

Research into Jackbox's public design principles ("The Jack Principles") and Party Pack art direction informs our approach:

| Principle | Jackbox Source | Mile High Games Interpretation |
|-----------|----------------|----------------------------|
| **Phone as controller** | One task at a time: text, buttons, or draw | Same constraint. Never stack multiple input modes on phone simultaneously. |
| **TV as theater** | Host narration, big type, stage transitions | Host screen is the "show." Room code always visible. Scores persist like a lower-third ticker. |
| **Illusion of awareness** | Game reacts to player names, pacing, silence | Player chips animate on join; submission counter ticks up; host label changes per phase. |
| **Pacing over complexity** | One choice per beat; timers create urgency | Phase machine: `lobby → prompt → input → reveal → vote → results → ended`. Skip button for host only. |
| **Per-game identity** | Fibbage = blue theater; Quiplash = orange quips; TMP2 = horror | Each game gets unique palette, pattern, host persona, and phase decorations (see `gameThemes.ts`). |
| **Sounds on host only** | Laughter comes from the group; audio cues anchor the TV | All SFX play on host device/browser tab. Phones stay silent (vibration optional for submit confirm). |

### 1.2 What We Are NOT Copying

- Licensed Jackbox characters, logos, pack art, or exact color hex values from retail assets
- Proprietary typefaces (we use **Bangers** + **Nunito** + **Space Grotesk** as originals)
- Exact UI layouts from retail screenshots

### 1.3 Mile High Games Brand Pillars

1. **Playful picker** — Game grid feels like flipping through a party shelf, not a settings menu.
2. **Prominent room codes** — `clamp(2.5rem, 12vw, 4rem)` Space Grotesk, letter-spaced, always top-center on host.
3. **Theatrical host** — Full-bleed game backgrounds, decorative emoji/host glyphs, phase titles as "act breaks."
4. **Tactile phones** — 48px min touch targets, pill buttons, `scale(0.97)` press feedback, safe-area padding.
5. **Saturated worlds** — Dark bases (`#09090b` global) with loud game accents at 85–100% saturation.
6. **Whimsical type** — Display headings in Space Grotesk; phase labels in uppercase tracked small caps.

---

## 2. Global Design Tokens

### 2.1 Color System

#### Shell (App Chrome)
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0f0a1a` | Page background (deep purple-black) |
| `--surface` | `#1a1430` | Cards, tiles |
| `--surface-2` | `#252040` | Chips, vote options |
| `--border` | `#4a3f6b` | Dividers, inputs |
| `--text` | `#fff8f0` | Body (warm white) |
| `--muted` | `#b8a9d4` | Labels, hints |
| `--primary` | `#ff6b35` | Default CTA, room code (pre-game) |
| `--primary-hover` | `#818cf8` | Hover states |
| `--success` | `#34d399` | Connected, correct |
| `--warning` | `#fbbf24` | Timer, 1st place |
| `--danger` | `#f87171` | Errors, urgent timer |

#### Per-Game Theming (applied via `.game-themed`)
| Token | Source | Usage |
|-------|--------|-------|
| `--game-accent` | `gameThemes.accent` | Timer fill, borders, CTA override |
| `--game-bg` | `gameThemes.background` | Host full-bleed background |
| Pattern class | `game-pattern-{pattern}` | Subtle CSS overlay at 6% opacity |

### 2.2 Typography

| Role | Family | Weight | Size | Notes |
|------|--------|--------|------|-------|
| Display / H1 | Space Grotesk | 700 | `clamp(1.75rem, 7vw, 2.5rem)` | Homepage title, game over |
| H2 / Game title | Space Grotesk | 600–700 | 18–32px | Lobby selected game |
| Prompt | Space Grotesk | 600 | `clamp(1.25rem, 5vw, 1.75rem)` | Center stage on host |
| Room code | Space Grotesk | 700 | `clamp(2.5rem, 12vw, 4rem)` | `letter-spacing: 0.2em` |
| Phase label | Inter | 500 | 12px | `uppercase; letter-spacing: 0.1em; color: muted` |
| Body | Inter | 400 | 14–16px | Phone inputs at 16px (no iOS zoom) |
| Timer digits | Space Grotesk | 600 | 14px | `font-variant-numeric: tabular-nums` |
| Badge | Inter | 500 | 10px | Round pills |

**Future whimsical faces (per-game overrides):** Consider loading one display face per game pack at runtime (e.g. slab serif for TMP2, rounded sans for Cookie Haus). Until then, emoji + pattern carry identity.

### 2.3 Spacing & Layout

| Token | Value |
|-------|-------|
| `--radius` | `16px` (cards), `12px` (inputs), `999px` (buttons/chips) |
| Page padding | `16px` (+ safe-area bottom) |
| Host wide layout | `.page-wide` — full width for game select grid |
| Phone max width | `640px` centered |
| Grid games | `minmax(140px, 1fr)` auto-fill |
| Touch min height | `48px` buttons, `64px` for primary game actions |

### 2.4 Animation Timing

| Token | Duration | Easing | Use |
|-------|----------|--------|-----|
| `--ease-out-expo` | — | `cubic-bezier(0.16, 1, 0.3, 1)` | Fly-ins |
| `--ease-bounce` | — | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Score pop |
| `--dur-instant` | `100ms` | — | Button press |
| `--dur-fast` | `150ms` | ease | Border/hover |
| `--dur-normal` | `300ms` | `--ease-out-expo` | Phase transitions |
| `--dur-slow` | `600ms` | `--ease-out-expo` | Host decorations |
| `--dur-dramatic` | `1200ms` | ease-in-out | Winner fanfare |

---

## 3. Page Specifications

### 3.1 Homepage (`/`)

**Purpose:** Entry point for host (TV) and players (phones). Zero friction — name + code only.

#### Layout
```
┌─────────────────────────────┐
│         🎲 (64px tile)      │
│      Mile High Games (H1)      │
│  Jackbox-style party games  │
│       ● Connected           │
├─────────────────────────────┤
│  [ 📺 Host Game (TV) ]      │  ← primary, full width
│  host is not a player hint  │
├─────────────────────────────┤
│  JOIN AS PLAYER card        │
│  [ name input ]             │
│  [ ABCD room code ]         │
│  [ 📱 Join Room ]           │
├─────────────────────────────┤
│  WiFi / hotspot footnote    │
└─────────────────────────────┘
```

#### Visual Specs
- Vertically centered column, max 640px
- Logo tile: 64×64, `--primary` background, radius 20px
- Connection dot: green `--success` / red `--danger`, 12px
- Invite URL mode (`?code=ABCD`): room code pre-filled, name field auto-focused

#### Animations
- Logo tile: subtle `pulse` on load (1 cycle)
- Host button: `fly-in` from bottom, 300ms delay
- Join card: `slide-up` 150ms after host button

#### Sounds (host path only after room created)
- None on homepage itself

---

### 3.2 Game Select / Picker (host lobby, no game selected)

**Purpose:** Playful shelf of all enabled games. Host picks the night's show.

#### Layout
```
┌──────────────────────────────────────────┐
│ ← Back          ROOM CODE (compact)      │
├──────────────────────────────────────────┤
│ Choose a Game                            │
│ [ Search games... ]                      │
│ [All] [Trivia] [Drawing] [Writing] ...   │
├──────────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│ │ 🪰 │ │ 🥔 │ │ 🎨 │ │ 💣 │ │ 🎪 │ ...  │
│ │Lie │ │Word│ │Bid │ │Bomb│ │Fak │      │
│ └────┘ └────┘ └────┘ └────┘ └────┘      │
│         grid-games responsive            │
├──────────────────────────────────────────┤
│        45 games available                │
└──────────────────────────────────────────┘
```

#### Game Tile Anatomy
- Emoji hero (from `gameThemes.emoji`)
- Title (truncated 2 lines)
- Player count badge (`3–8`)
- Selected state: `--primary` border, `#1e1b4b` tint, `scale(0.98)`
- Hover/active: border brightens to game accent on select

#### Interactions
- Tap tile → prefetch meta → highlight → host sees lobby preview card below grid (in Room page)
- Search filters live; type chips toggle `gameType`
- Staggered `fly-in` per tile row (50ms cascade)

#### Sound
- Soft `click` on tile select (host)
- `whoosh` when confirming game (transition to lobby card)

---

### 3.3 Lobby — Host View

**Purpose:** Waiting room + game preview + start gate.

#### Layout
```
┌──────────────────────────────────────────┐
│              ABCD  (HUGE)                │
│           4 players joined               │
├──────────────────────────────────────────┤
│  [Alice] [Bob] [Carol] [Dave]  chips     │
├──────────────────────────────────────────┤
│  ┌ Selected Game Card ─────────────┐     │
│  │  🪰 Lie Swatter                 │     │
│  │  description...                 │     │
│  │  Requires 2–8 players             │     │
│  │  [ Start Game ]                 │     │
│  │  [ ← Choose different game ]    │     │
│  └─────────────────────────────────┘     │
└──────────────────────────────────────────┘
```

#### Visual Specs
- `.game-themed` wrapper applies once game selected: `--game-bg`, pattern overlay, accent timer
- `RoomCodeBanner`: code + player count
- Player chips: `fly-in` stagger on join; new chip `bounce`
- Start button disabled until `minPlayers` met; label shows deficit count
- Host-only controls; no player inputs on host device

#### Animations
- Each join: chip `bounce` + host `join chime`
- Game card: `slide-up` when game selected
- Background pattern fades in 600ms

---

### 3.4 Lobby — Client (Player Phone)

#### Layout
```
┌─────────────────────────────┐
│  🪰  FLY GUY                 │  game-theme-header
├─────────────────────────────┤
│       JOINED ROOM           │
│  Waiting for host to start  │
│                             │
│  Players: Alice, Bob...     │
│                             │
│  (no start button)          │
└─────────────────────────────┘
```

- Themed header when game picked
- Passive waiting state; optional idle `pulse` on "waiting" text
- Phone silent; optional light haptic on successful join only

---

### 3.5 In-Game Phases — Shared Host Chrome

All in-game host views share:

```
┌──────────────────────────────────────────┐
│  ABCD · 4 players          (compact)   │
├──────────────────────────────────────────┤
│ Round 2/3 · Lie Swatter    [Skip →]    │
├──────────────────────────────────────────┤
│              🪰 (host-decoration)       │
│            PHASE LABEL                  │
│  ═══════════ timer bar ═══════════     │
│                                          │
│         PROMPT TEXT (big)                │
│         sub-prompt (muted)               │
│                                          │
│         [ phase-specific content ]       │
│                                          │
│  ┌ SCORES ─────────────────────────┐    │
│  │ Alice        2400               │    │
│  │ Bob          1800               │    │
│  └─────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

**Phase label defaults:** Get Ready · Answer Now · Reveal · Vote · Round Results

---

### 3.6 In-Game Phases — Shared Client Chrome

```
┌─────────────────────────────┐
│  game theme header          │
├─────────────────────────────┤
│  phase label                │
│  timer bar (when active)    │
│  prompt / sub-prompt        │
│  [ phase-specific input ]   │
│  [ submit / vote buttons ]  │
└─────────────────────────────┘
```

---

## 4. Phase System (Host + Client)

### 4.1 `lobby`
| Surface | Host | Client |
|---------|------|--------|
| Primary focus | Room code, player list, start | Waiting message |
| Animation | Chips bounce in | Theme header fades in |
| Audio | Join chime per player | — |

### 4.2 `prompt`
| Surface | Host | Client |
|---------|------|--------|
| Primary focus | "Get Ready" + upcoming prompt teaser | Same prompt preview |
| Animation | `fly-in` prompt text; decoration `bounce` | Countdown pulse |
| Audio | Phase whoosh | — |
| Duration | Short (3–5s); no input | Read-only |

### 4.3 `input`
| Surface | Host | Client |
|---------|------|--------|
| Primary focus | Prompt + submission counter `X/Y` | Input UI per archetype |
| Animation | Counter ticks with `squish` | Submit button `pulse` when valid |
| Audio | Timer tick (last 5s urgent) | — |
| Timer | Full-width `--game-accent` bar | Same |

### 4.4 `reveal`
| Surface | Host | Client |
|---------|------|--------|
| Primary focus | Entries grid, images, pairs | Read-only (watch TV) |
| Animation | Cards `fly-in` stagger 80ms | — |
| Audio | Stinger per reveal type | — |

### 4.5 `vote`
| Surface | Host | Client |
|---------|------|--------|
| Primary focus | "Players are voting..." | `vote-pair` or option list |
| Animation | Options already on host from reveal | Selected option `squish` |
| Audio | Suspense loop (low) optional | — |

### 4.6 `results`
| Surface | Host | Client |
|---------|------|--------|
| Primary focus | Correct answer, round scores | Round points summary |
| Animation | Leaderboard rows `slide-up`; winner row `pulse` | Points `fly-in` |
| Audio | Correct/wrong stingers | — |

### 4.7 `ended`
| Surface | Host | Client |
|---------|------|--------|
| Primary focus | Winner + final leaderboard | Final standings |
| Animation | `confetti` + winner name `bounce` | — |
| Audio | Winner fanfare | — |
| CTA | Back to Lobby (host) | Thank you state |

---

## 5. Archetype UI Patterns

Archetypes from `server/src/games/registry.ts` define shared phone input and host reveal layouts. Per-game docs customize colors and decorations.

| Archetype | Phone Input | Host Reveal | Host Results |
|-----------|-------------|-------------|--------------|
| `write-vote` | Textarea + Submit | Entry cards stagger | Vote counts + points |
| `fibbage` | Textarea per blank | Anonymized answers + truth | Lie points breakdown |
| `draw-guess` | Canvas + color/size + Submit | Image cards | Guesser/artist points |
| `draw-bracket` | Canvas (shirt frame) | Bracket tree + images | Match winner highlight |
| `trivia` | 4-option buttons | Correct answer flash | +/- points per player |
| `trivia-bool` | TRUTH / LIE split buttons | Statement + swat result | Fastest finger bonus |
| `survival-trivia` | 4-option + ghost state | Alive/dead player badges | Elimination sting |
| `hidden-task` | Task card (private) + action buttons | Role reveals | Accusation results |
| `teamwork` | Team prompt + text/buttons | Team progress grid | Team score split |
| `bracket` | Text support + vote | Bracket visualization | Advance animation |
| `word-chain` | Single word input | Chain visualization | Valid/invalid flash |
| `rank` | Drag list or comma order | Sorted reveal | Consensus meter |
| `sort` | Ordered list input | Correct order reveal | Placement score |
| `debate` | Topic + argument textarea | Split screen arguments | Side vote bars |
| `role-label` | Label picker grid | Role wheel | Match points |
| `text-transform` | Transform UI (mad lib) | Before/after columns | Transformation reveal |
| `pitch` | Pitch textarea | Pitch cards | Investor vote bars |
| `finish-sentence` | Sentence completion field | Completed sentences | Best completion crown |

---

## 6. Sound Design (Host Only)

All audio plays on the **host browser tab** only. Players' phones remain silent unless optional haptic on submit.

| Cue ID | Trigger | Character | Duration |
|--------|---------|-----------|----------|
| `sfx-join` | Player connects | Bright chime, major triad | 0.4s |
| `sfx-leave` | Player disconnects | Soft descending tone | 0.3s |
| `sfx-phase-whoosh` | Any phase transition | Airy swipe + subtle click | 0.5s |
| `sfx-timer-tick` | Last 5s of timed phase | Clock tick, increasing rate | loop |
| `sfx-timer-urgent` | Last 3s | Low drum pulse | loop |
| `sfx-submit-ding` | All players submitted early | Positive ding | 0.2s |
| `sfx-correct` | Correct answer / winning vote | Ascending stinger | 0.6s |
| `sfx-wrong` | Wrong / eliminated | Descending buzz | 0.5s |
| `sfx-reveal-pop` | Each reveal card appears | Soft pop | 0.15s |
| `sfx-vote-cast` | Majority voted (host info) | Whoosh | 0.3s |
| `sfx-winner` | Game ended | Fanfare + crowd layer | 2.0s |
| `sfx-skip` | Host skips phase | Quick swipe | 0.2s |

### Per-Game Sound Overrides
Games may override stingers to match theme (e.g. TMP2 horror sting, Cookie Haus oven ding). See individual game docs in `games/`.

### Implementation Notes
- Preload on host lobby
- Respect `prefers-reduced-motion`: disable audio if user disables motion (optional setting)
- Volume slider in host settings (future)

---

## 7. Animation Library

### 7.1 Core Keyframes

#### `fly-in`
```css
@keyframes fly-in {
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```
**Use:** Prompts, cards, tiles. Duration: `--dur-normal`.

#### `bounce`
```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  40% { transform: translateY(-12px); }
  60% { transform: translateY(-6px); }
}
```
**Use:** Player join chips, winner name, decorations.

#### `shake`
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}
```
**Use:** Wrong answer, elimination, invalid input feedback on host.

#### `confetti`
Host-only canvas/particle overlay; 2s burst on `ended` phase. Game-accent colored particles.

#### `slide-up`
```css
@keyframes slide-up {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
```
**Use:** Leaderboard rows, game card, join panel.

#### `pulse`
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.04); opacity: 0.9; }
}
```
**Use:** Waiting states, submit CTA when ready, timer urgent state.

#### `squish`
```css
@keyframes squish {
  0% { transform: scale(1, 1); }
  50% { transform: scale(1.06, 0.94); }
  100% { transform: scale(1, 1); }
}
```
**Use:** Button press confirm, vote selection, submission count tick.

### 7.2 Phase Transition Pattern
1. Outgoing content: `opacity 0` + `translateY(-12px)` over 150ms
2. Phase label swap + `sfx-phase-whoosh`
3. Incoming content: `fly-in` 300ms
4. Host decoration: `bounce` 600ms delay 100ms

### 7.3 Reduced Motion
When `prefers-reduced-motion: reduce`:
- Replace fly/bounce with simple `opacity` fade
- Disable confetti
- Timer bar changes color only (no pulse)

---

## 8. Accessibility & Responsive Rules

- **Contrast:** Prompt text and room code must meet WCAG AA on game backgrounds (use scrim if needed)
- **Touch:** 48×48px minimum; 64px for gameplay primaries
- **Focus:** Visible focus ring on keyboard nav (host desktop)
- **Screen size:** Host targets 1080p TV; phone 320–428px wide
- **Color-blind:** Never encode state with color alone; pair with icons/text (✓/✗)
- **Timer:** Numeric + bar; urgent state also pulses

---

## 9. Per-Game Documentation Index

Each game has a dedicated UI spec in `games/`. Gameplay rules are intentionally excluded.

### Jackbox Party Pack 1
| Game | Doc | Archetype |
|------|-----|-----------|
| Lie Swatter | [lie-swatter.md](games/lie-swatter.md) | `trivia-bool` |
| Word Spud | [word-spud.md](games/word-spud.md) | `word-chain` |

### Jackbox Party Pack 2
| Game | Doc | Archetype |
|------|-----|-----------|
| Bidiots | [bidiots.md](games/bidiots.md) | `draw-guess` |
| Bomb Corp. | [bomb-corp.md](games/bomb-corp.md) | `teamwork` |

### Jackbox Party Pack 3
| Game | Doc | Archetype |
|------|-----|-----------|
| Fakin' It! | [fakin-it.md](games/fakin-it.md) | `hidden-task` |
| Guesspionage | [guesspionage.md](games/guesspionage.md) | `trivia` |

### Jackbox Party Pack 4
| Game | Doc | Archetype |
|------|-----|-----------|
| Bracketeering | [bracketeering.md](games/bracketeering.md) | `bracket` |
| Civic Doodle | [civic-doodle.md](games/civic-doodle.md) | `draw-guess` |
| Monster Seeking Monster | [monster-seeking-monster.md](games/monster-seeking-monster.md) | `hidden-task` |
| Survive the Internet | [survive-the-internet.md](games/survive-the-internet.md) | `text-transform` |

### Jackbox Party Pack 5
| Game | Doc | Archetype |
|------|-----|-----------|
| Mad Verse City | [mad-verse-city.md](games/mad-verse-city.md) | `write-vote` |
| Patently Stupid | [patently-stupid.md](games/patently-stupid.md) | `draw-guess` |
| Split the Room | [split-the-room.md](games/split-the-room.md) | `rank` |
| You Don't Know Jack Full Stream | [you-don-t-know-jack-full-stream.md](games/you-don-t-know-jack-full-stream.md) | `trivia` |
| Zeeple Dome | [zeeple-dome.md](games/zeeple-dome.md) | `teamwork` |

### Jackbox Party Pack 6
| Game | Doc | Archetype |
|------|-----|-----------|
| Dictionarium | [dictionarium.md](games/dictionarium.md) | `write-vote` |
| Joke Boat | [joke-boat.md](games/joke-boat.md) | `write-vote` |
| Push the Button | [push-the-button.md](games/push-the-button.md) | `hidden-task` |
| Role Models | [role-models.md](games/role-models.md) | `role-label` |
| Trivia Murder Party 2 | [trivia-murder-party-2.md](games/trivia-murder-party-2.md) | `survival-trivia` |

### Jackbox Party Pack 7
| Game | Doc | Archetype |
|------|-----|-----------|
| Blather 'Round | [blather-round.md](games/blather-round.md) | `word-chain` |
| Champ'd Up | [champ-d-up.md](games/champ-d-up.md) | `draw-guess` |
| Quiplash 3 | [quiplash-3.md](games/quiplash-3.md) | `write-vote` |
| Talking Points | [talking-points.md](games/talking-points.md) | `debate` |
| The Devils and the Details | [the-devils-and-the-details.md](games/the-devils-and-the-details.md) | `teamwork` |

### Jackbox Party Pack 8
| Game | Doc | Archetype |
|------|-----|-----------|
| Drawful Animate | [drawful-animate.md](games/drawful-animate.md) | `draw-guess` |
| Job Job | [job-job.md](games/job-job.md) | `write-vote` |
| The Poll Mine | [the-poll-mine.md](games/the-poll-mine.md) | `rank` |
| The Wheel of Enormous Proportions | [the-wheel-of-enormous-proportions.md](games/the-wheel-of-enormous-proportions.md) | `trivia` |
| Weapons Drawn | [weapons-drawn.md](games/weapons-drawn.md) | `draw-guess` |

### Jackbox Party Pack 9
| Game | Doc | Archetype |
|------|-----|-----------|
| Fibbage 4 | [fibbage-4.md](games/fibbage-4.md) | `fibbage` |
| Junktopia | [junktopia.md](games/junktopia.md) | `pitch` |
| Nonsensory | [nonsensory.md](games/nonsensory.md) | `write-vote` |
| Quixort | [quixort.md](games/quixort.md) | `sort` |
| Roomerang | [roomerang.md](games/roomerang.md) | `pitch` |

### Jackbox Party Pack 10
| Game | Doc | Archetype |
|------|-----|-----------|
| Fixy Text | [fixy-text.md](games/fixy-text.md) | `text-transform` |
| Hypnotorious | [hypnotorious.md](games/hypnotorious.md) | `hidden-task` |
| Tee K.O. 2 | [tee-k-o-2.md](games/tee-k-o-2.md) | `draw-bracket` |
| Time Jinx | [time-jinx.md](games/time-jinx.md) | `trivia` |

### Jackbox Party Pack 11
| Game | Doc | Archetype |
|------|-----|-----------|
| Doominate | [doominate.md](games/doominate.md) | `write-vote` |
| Cookie Haus | [cookie-haus.md](games/cookie-haus.md) | `draw-guess` |
| Suspectives | [suspectives.md](games/suspectives.md) | `hidden-task` |
| Legends of Trivia | [legends-of-trivia.md](games/legends-of-trivia.md) | `trivia` |

### The Jackbox Naughty Pack
| Game | Doc | Archetype |
|------|-----|-----------|
| Fakin' It All Night Long | [fakin-it-all-night-long.md](games/fakin-it-all-night-long.md) | `hidden-task` |
| Dirty Drawful | [dirty-drawful.md](games/dirty-drawful.md) | `draw-guess` |
| Let Me Finish | [let-me-finish.md](games/let-me-finish.md) | `finish-sentence` |

---

## Appendix: File References

| File | Purpose |
|------|---------|
| `client/src/data/gameCatalog.ts` | Enabled game IDs |
| `client/src/data/gameThemes.ts` | Per-game colors, emoji, host, pattern |
| `server/src/games/registry.ts` | Archetype mapping |
| `client/src/index.css` | Global tokens + patterns |
| `client/src/components/HostDisplay.tsx` | Host phase layouts |
| `client/src/components/GameInput.tsx` | Phone input by archetype |

---

*Last updated: June 2026 — Mile High Games UI Design System v1.0*

## Per-Game UI Documents

- [Lie Swatter](games/lie-swatter.md)
- [Word Spud](games/word-spud.md)
- [Bidiots](games/bidiots.md)
- [Bomb Corp.](games/bomb-corp.md)
- [Fakin' It!](games/fakin-it.md)
- [Guesspionage](games/guesspionage.md)
- [Bracketeering](games/bracketeering.md)
- [Civic Doodle](games/civic-doodle.md)
- [Monster Seeking Monster](games/monster-seeking-monster.md)
- [Survive the Internet](games/survive-the-internet.md)
- [Mad Verse City](games/mad-verse-city.md)
- [Patently Stupid](games/patently-stupid.md)
- [Split the Room](games/split-the-room.md)
- [You Don't Know Jack Full Stream](games/you-don-t-know-jack-full-stream.md)
- [Zeeple Dome](games/zeeple-dome.md)
- [Dictionarium](games/dictionarium.md)
- [Joke Boat](games/joke-boat.md)
- [Push the Button](games/push-the-button.md)
- [Role Models](games/role-models.md)
- [Trivia Murder Party 2](games/trivia-murder-party-2.md)
- [Blather 'Round](games/blather-round.md)
- [Champ'd Up](games/champ-d-up.md)
- [Quiplash 3](games/quiplash-3.md)
- [Talking Points](games/talking-points.md)
- [The Devils and the Details](games/the-devils-and-the-details.md)
- [Drawful Animate](games/drawful-animate.md)
- [Job Job](games/job-job.md)
- [The Poll Mine](games/the-poll-mine.md)
- [The Wheel of Enormous Proportions](games/the-wheel-of-enormous-proportions.md)
- [Weapons Drawn](games/weapons-drawn.md)
- [Fibbage 4](games/fibbage-4.md)
- [Junktopia](games/junktopia.md)
- [Nonsensory](games/nonsensory.md)
- [Quixort](games/quixort.md)
- [Roomerang](games/roomerang.md)
- [Fixy Text](games/fixy-text.md)
- [Hypnotorious](games/hypnotorious.md)
- [Tee K.O. 2](games/tee-k-o-2.md)
- [Time Jinx](games/time-jinx.md)
- [Doominate](games/doominate.md)
- [Cookie Haus](games/cookie-haus.md)
- [Suspectives](games/suspectives.md)
- [Legends of Trivia](games/legends-of-trivia.md)
- [Fakin' It All Night Long](games/fakin-it-all-night-long.md)
- [Dirty Drawful](games/dirty-drawful.md)
- [Let Me Finish](games/let-me-finish.md)
