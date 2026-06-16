# Suspectives — UI Design

> Game ID: `suspectives` · Archetype: `write-vote` · Pack: Jackbox Party Pack 11
> **Inspiration (not a copy):** Suspectives — noir detective, cyan clues

---

## Visual Identity

| Token | Value |
|-------|-------|
| Accent | #06b6d4 |
| Pattern | `game-pattern-mystery` |
| Mood | Comedy club — mic spotlight, orange/warm quip energy |
| Icons | 🔍🕵️ |
| Host persona | Detective 🔍 |

Background uses radial gradient from themed dark tone into app base (`--bg`). Decorative pattern layer at 6–8% opacity. Never use licensed Jackbox assets — emoji + CSS patterns only.

---

## Typography & Icons

- **Host headings:** Bangers display font, uppercase phase labels with 0.14em tracking
- **Prompts:** Nunito 700, clamp(1.35rem, 5vw, 2rem) on host; slightly smaller on phones
- **Buttons:** Nunito 700–800, pill shape, 48px min touch target
- **Emoji decorations:** 🔍 as host decoration with `host-pop` animation on phase entry

---

## Host Screen

### Lobby
- Room code banner with glow pulse; player chips pop in staggered (60ms)
- Selected game card shows large emoji, title in display font, Start button with rocket icon
- **Animation:** `bounce-in` on game card; chips use `chip-pop`

### Prompt
- Phase label in accent color; Detective emoji wiggles
- Prompt slides up inside `prompt-card` with glow border
- **Sound:** `prompt` chime (host only)

### Input
- Answers fly onto stage cards; vote pairs face off
- Submission tracker dots fill green as players submit
- **Sound:** soft `submit` blip per player completion

### Reveal
- Entries stagger `slide-up` 80ms apart
- Drawing entries get rounded frame; text entries bold weight
- **Sound:** `reveal` chord

### Vote
- "Players are voting" card; optional split-screen preview for pairs
- **Sound:** `vote` tone

### Results
- Correct answer in success green; "Round complete!" bounces in
- Leaderboard rows cascade with delay
- **Sound:** `correct` stinger

### Ended
- Confetti burst (40 pieces); winner banner with crown on #1
- **Sound:** `winner` fanfare

---

## Player Phone

### Lobby
- "You're in!" label; room code prominent; waiting message
- Player chips animate in — no sounds on client

### Prompt
- `prompt-card` with get-ready label; read prompt before input opens

### Input
- Textarea with char count, bold submit
- Submitted state: large checkmark, squish-in animation, green success text
- **No sounds on player device**

### Reveal
- TV icon wiggle + "Look at the host screen!" — no spoilers on phone

### Vote
- Vote options with 3px border; active press scales to 0.96 with glow
- Submitted: ballot emoji + waiting message

### Results
- Shows correct answer if applicable; points to host for full results

### Ended
- Leaderboard with crown on first place

---

## Sound Cues (Host Device Only)

| Event | Sound ID |
|-------|----------|
| Player joins | `join` |
| Phase change | `phase` |
| Prompt shown | `prompt` |
| Player submits | `submit` |
| Reveal | `reveal` |
| Vote phase | `vote` |
| Round results | `correct` |
| Timer < 25% | `timer-urgent` |
| Game over | `winner` |
| Game selected | `select` |

Rimshot hint, applause on reveal

---

## Micro-interactions

1. **Phase transitions** — content exits with fade; new phase enters with archetype-appropriate animation (slide-up default)
2. **Timer** — bar drains with accent gradient; urgent state shakes count and pulses bar
3. **Buttons** — scale 0.94 on press with spring easing
4. **Game theme header** — emoji wiggle loop; host name in muted caps
5. **Scroll** — sticky nav with blurred game-tinted background during play

---

## Accessibility Notes

- Minimum 4.5:1 contrast on text; timer also shown numerically
- `aria-live` on timer; decorative emoji marked `aria-hidden`
- Reduced motion: respect `prefers-reduced-motion` (future — disable confetti/wiggle)
