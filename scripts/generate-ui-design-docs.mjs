/**
 * Generates per-game UI design docs in ui-design-docs/games/
 * Run: node scripts/generate-ui-design-docs.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'ui-design-docs', 'games');

const DISABLED = new Set(['earwax', 'hear-say', 'dodo-re-mi']);

const ARCHETYPE_UI = {
  'trivia-bool': {
    mood: 'Fast reflex arcade — slap the lie, dodge the truth',
    hostAnim: 'Statement flies in from left on a decorative carrier (fly, card, stamp). Squash/strike animation on reveal.',
    clientUI: 'Two oversized pill buttons (TRUTH green / LIE red), full-width, haptic press depth',
    sounds: 'Buzz on prompt, slap on reveal, squish stinger',
  },
  'word-chain': {
    mood: 'Wordplay parlor — cozy, sequential, building tension',
    hostAnim: 'Words chain across screen left-to-right; each link pops in',
    clientUI: 'Single text field, character limit visible, submit bounces',
    sounds: 'Typewriter tick, chain clink on submit',
  },
  'draw-guess': {
    mood: 'Sketch pad energy — white canvas, colorful chrome',
    hostAnim: 'Drawing reveals with curtain pull or frame zoom',
    clientUI: 'Full-width canvas, chunky color/size tools, clear submit',
    sounds: 'Marker scratch loop (subtle), ta-da on submit',
  },
  'teamwork': {
    mood: 'Co-op pressure — split roles, urgent but friendly',
    hostAnim: 'Role cards deal out to player slots',
    clientUI: 'Large option buttons or role-reveal card with accent border',
    sounds: 'Team horn, countdown beep',
  },
  'hidden-task': {
    mood: 'Social deduction — secret folders, carnival or spaceship dressing',
    hostAnim: 'Task envelope slides to player (client only); host shows group activity',
    clientUI: 'SECRET TASK card with warning border, then answer field',
    sounds: 'Mystery sting, shuffle cards',
  },
  trivia: {
    mood: 'Game show — spotlight, big type, confident host energy',
    hostAnim: 'Question slams down center; options appear as tiles',
    clientUI: 'Stacked answer buttons, selected state glows',
    sounds: 'Game-show ding, thinking hum',
  },
  'survival-trivia': {
    mood: 'Horror game show — red accents, skull motifs, dark comedy',
    hostAnim: 'Question emerges from shadows; wrong answers trigger shake',
    clientUI: 'Same as trivia but danger-red timer',
    sounds: 'Ominous chord, heartbeat urgent timer',
  },
  bracket: {
    mood: 'Tournament board — brackets slide, matchups highlighted',
    hostAnim: 'Bracket tree animates; winners advance with bounce',
    clientUI: 'Fill-in or pick; vote pairs side by side',
    sounds: 'Crowd swell, gavel tap',
  },
  'text-transform': {
    mood: 'Internet parody — browser chrome, meme textures',
    hostAnim: 'Fake UI windows stack and shuffle',
    clientUI: 'Transform prompt in monospace or social-post style',
    sounds: 'Notification ping, dial-up glitch',
  },
  'write-vote': {
    mood: 'Comedy club — mic spotlight, orange/warm quip energy',
    hostAnim: 'Answers fly onto stage cards; vote pairs face off',
    clientUI: 'Textarea with char count, bold submit',
    sounds: 'Rimshot hint, applause on reveal',
  },
  rank: {
    mood: 'Opinion split — scale or ladder visual',
    hostAnim: 'Spectrum bar fills as votes land',
    clientUI: 'Ordered list input or drag-ranked items',
    sounds: 'Slide whistle, balance chime',
  },
  fibbage: {
    mood: 'Blue theater — Cookie Masterson energy, velvet curtain',
    hostAnim: 'Prompt on marquee; lies shuffle like cards; truth spotlight',
    clientUI: 'Lie textarea + Lie For Me button (half points)',
    sounds: 'Theater drumroll, reveal ta-da',
  },
  pitch: {
    mood: 'Shark tank / junk heap — podium or trash pile aesthetic',
    hostAnim: 'Pitch cards toss onto table',
    clientUI: 'Persuasive text input, character limit',
    sounds: 'Cash register, buzzer',
  },
  sort: {
    mood: 'Library chaos — bookshelves, tumbling tiles',
    hostAnim: 'Items fall into bins on host; team colors',
    clientUI: 'Comma-separated order input',
    sounds: 'Book thud, shelf slide',
  },
  debate: {
    mood: 'News desk — split screen, anchor gravitas',
    hostAnim: 'Talking heads frame; argument cards slide',
    clientUI: 'Stance picker + optional text',
    sounds: 'News sting, applause',
  },
  'role-label': {
    mood: 'Party labels — stickers, silly badges',
    hostAnim: 'Labels stick onto player avatars',
    clientUI: 'Pick label or assign',
    sounds: 'Sticker peel, pop',
  },
  'draw-bracket': {
    mood: 'Fighting tournament — shirt designs battle',
    hostAnim: 'Bracket with shirt thumbnails; KO animations',
    clientUI: 'Drawing canvas for design',
    sounds: 'Bell ding, crowd roar',
  },
  'finish-sentence': {
    mood: 'Talk show — interrupted sentence, mic icon',
    hostAnim: 'Sentence builds word by word on host',
    clientUI: 'Finish the phrase input',
    sounds: 'Mic feedback, finish horn',
  },
};

const GAME_OVERRIDES = {
  'lie-swatter': { inspiration: 'Jackbox Lie Swatter — flies carry facts, neon green swamp', icons: '🪰💥', palette: 'lime #84cc16 on dark olive' },
  'fibbage-4': { inspiration: 'Fibbage theater — Cookie, blue stage, spotlights', icons: '🎭🃏', palette: 'royal blue #3b82f6' },
  'quiplash-3': { inspiration: 'Quiplash — orange quip bubbles, Schmitty energy', icons: '💬😂', palette: 'warm orange #f97316' },
  'trivia-murder-party-2': { inspiration: 'TMP2 — Death host, blood red, haunted mansion', icons: '💀🔪', palette: 'crimson #dc2626' },
  'time-jinx': { inspiration: 'Timejinx — retro science lab, UPA blocky style', icons: '⏳🧪', palette: 'violet #8b5cf6' },
  'tee-k-o-2': { inspiration: 'Tee K.O. 2 — wrestling ring, shirt bracket', icons: '👕🥊', palette: 'hot pink #f43f5e' },
  'cookie-haus': { inspiration: 'Cookie Haus — warm bakery, cookie characters', icons: '🍪🏠', palette: 'amber #f59e0b' },
  suspectives: { inspiration: 'Suspectives — noir detective, cyan clues', icons: '🔍🕵️', palette: 'cyan #06b6d4' },
  doominate: { inspiration: 'Doominate — medieval throne, red crown', icons: '👑⚔️', palette: 'crimson #dc2626' },
  'legends-of-trivia': { inspiration: 'Legends of Trivia — game show gold', icons: '🏅📺', palette: 'gold #f59e0b' },
  'dirty-drawful': { inspiration: 'Naughty Drawful — pink neon, sketch pad', icons: '🔞✏️', palette: 'pink #ec4899' },
  'fixy-text': { inspiration: 'FixyText — glitch machines, ASCII faces', icons: '📱⚡', palette: 'cyan glitch #22d3ee' },
  hypnotorious: { inspiration: 'Hypnotorious — spiral hypnosis, purple haze', icons: '🌀👁️', palette: 'purple #a855f7' },
  'drawful-animate': { inspiration: 'Drawful Animate — purple sketch + motion', icons: '✏️🎬', palette: 'purple #a855f7' },
  'fakin-it': { inspiration: 'Fakin It — carnival Cookie, yellow stripes', icons: '🎪🍪', palette: 'gold #eab308' },
  'guesspionage': { inspiration: 'Guesspionage — spy dossier, cyan intel', icons: '🕵️📊', palette: 'cyan #06b6d4' },
  'split-the-room': { inspiration: 'Split the Room — owl host, balanced scale', icons: '🦉⚖️', palette: 'gold #eab308' },
  'survive-the-internet': { inspiration: 'Survive the Internet — browser windows, Moxie', icons: '🌐💬', palette: 'sky #0ea5e9' },
  'push-the-button': { inspiration: 'Push the Button — spaceship sci-fi red alert', icons: '🚀🔴', palette: 'red #ef4444' },
  junktopia: { inspiration: 'Junktopia — trash heap kingdom, lime green', icons: '🗑️👑', palette: 'lime #84cc16' },
  quixort: { inspiration: 'Quixort — library sorting, indigo shelves', icons: '📚📦', palette: 'indigo #6366f1' },
  roomerang: { inspiration: 'Roomerang — boomerang variety show', icons: '🪃🎬', palette: 'orange #f97316' },
  'the-wheel-of-enormous-proportions': { inspiration: 'Wheel of Enormous Proportions — giant carnival wheel', icons: '🎡🎯', palette: 'amber #f59e0b' },
  'weapons-drawn': { inspiration: 'Weapons Drawn — ninja dojo, red blades', icons: '🗡️🥷', palette: 'red #ef4444' },
  'mad-verse-city': { inspiration: 'Mad Verse City — rap battle neon city', icons: '🎤🌃', palette: 'rose #f43f5e' },
  'patently-stupid': { inspiration: 'Patently Stupid — patent office cyan', icons: '💡📋', palette: 'cyan #22d3ee' },
  'civic-doodle': { inspiration: 'Civic Doodle — mayor town hall purple', icons: '🏛️🖌️', palette: 'purple #a855f7' },
  'monster-seeking-monster': { inspiration: 'Monster Seeking Monster — dating app monsters', icons: '👾💜', palette: 'violet #8b5cf6' },
  'blather-round': { inspiration: 'Blather Round — owl word chain', icons: '🦉🔗', palette: 'lavender #a78bfa' },
  'champ-d-up': { inspiration: "Champ'd Up — superhero roster pink", icons: '🦸💥', palette: 'rose #f43f5e' },
  'talking-points': { inspiration: 'Talking Points — news desk teal', icons: '📺🗣️', palette: 'teal #14b8a6' },
  'the-devils-and-the-details': { inspiration: 'Devils and Details — hell kitchen teamwork', icons: '😈🍳', palette: 'red #dc2626' },
  'job-job': { inspiration: 'Job Job — corporate HR gray-blue', icons: '💼📎', palette: 'slate #64748b' },
  'the-poll-mine': { inspiration: 'Poll Mine — mine shaft brown', icons: '⛏️🪨', palette: 'stone #78716c' },
  'bidiots': { inspiration: 'Bidiots — art auction green', icons: '🎨💰', palette: 'green #22c55e' },
  'bomb-corp': { inspiration: 'Bomb Corp — office bomb squad red', icons: '💣🏢', palette: 'red #ef4444' },
  'zeeple-dome': { inspiration: 'Zeeple Dome — alien arena green', icons: '👽🎯', palette: 'green #22c55e' },
  dictionarium: { inspiration: 'Dictionarium — dictionary orange', icons: '📖✏️', palette: 'orange #f97316' },
  'joke-boat': { inspiration: 'Joke Boat — nautical comedy blue', icons: '⛵😂', palette: 'sky #38bdf8' },
  'role-models': { inspiration: 'Role Models — party stickers pink', icons: '🎭🏷️', palette: 'pink #ec4899' },
  'you-don-t-know-jack-full-stream': { inspiration: 'YDKJ — trivia indigo, Buzz! energy', icons: '❓💡', palette: 'indigo #6366f1' },
  'word-spud': { inspiration: 'Word Spud — potato word chain orange', icons: '🥔📝', palette: 'orange #f97316' },
  bracketeering: { inspiration: 'Bracketeering — tournament gold', icons: '🏆📊', palette: 'amber #f59e0b' },
  nonsensory: { inspiration: 'Nonsensory — sensory overload purple', icons: '👃👁️', palette: 'purple #c084fc' },
  'fakin-it-all-night-long': { inspiration: 'Naughty Fakin It — moonlit carnival', icons: '🌙🎪', palette: 'gold #eab308' },
  'let-me-finish': { inspiration: 'Let Me Finish — talk show teal mic', icons: '🎤✋', palette: 'teal #14b8a6' },
};

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const games = loadJson(path.join(ROOT, 'shared', 'games.json')).filter((g) => !DISABLED.has(g.id));
const themes = fs.readFileSync(path.join(ROOT, 'client', 'src', 'data', 'gameThemes.ts'), 'utf8');
const archetypeMap = {};
const archBlock = fs.readFileSync(path.join(ROOT, 'server', 'src', 'games', 'registry.ts'), 'utf8');
for (const m of archBlock.matchAll(/'([^']+)':\s*'([^']+)'/g)) {
  archetypeMap[m[1]] = m[2];
}

fs.mkdirSync(OUT, { recursive: true });

for (const g of games) {
  const id = g.id;
  const themeMatch = themes.match(new RegExp(`'${id}':\\s*\\{[^}]+\\}`));
  let accent = '#6366f1', emoji = '🎮', hostName = 'Host', pattern = 'party', pack = g['Game Pack'];
  if (themeMatch) {
    const t = themeMatch[0];
    const accentM = t.match(/"accent":\s*"([^"]+)"/);
    const emojiM = t.match(/"emoji":\s*"([^"]+)"/);
    const hostM = t.match(/"hostName":\s*"([^"]+)"/);
    const patM = t.match(/"pattern":\s*"([^"]+)"/);
    if (accentM) accent = accentM[1];
    if (emojiM) emoji = emojiM[1];
    if (hostM) hostName = hostM[1];
    if (patM) pattern = patM[1];
  }
  const archetype = archetypeMap[id] || 'write-vote';
  const arch = ARCHETYPE_UI[archetype] || ARCHETYPE_UI['write-vote'];
  const over = GAME_OVERRIDES[id] || { inspiration: `${g['Game Title']} — unique party energy`, icons: emoji, palette: accent };

  const doc = `# ${g['Game Title']} — UI Design

> Game ID: \`${id}\` · Archetype: \`${archetype}\` · Pack: ${pack}
> **Inspiration (not a copy):** ${over.inspiration}

---

## Visual Identity

| Token | Value |
|-------|-------|
| Accent | ${accent} |
| Pattern | \`game-pattern-${pattern}\` |
| Mood | ${arch.mood} |
| Icons | ${over.icons} |
| Host persona | ${hostName} ${emoji} |

Background uses radial gradient from themed dark tone into app base (\`--bg\`). Decorative pattern layer at 6–8% opacity. Never use licensed Jackbox assets — emoji + CSS patterns only.

---

## Typography & Icons

- **Host headings:** Bangers display font, uppercase phase labels with 0.14em tracking
- **Prompts:** Nunito 700, clamp(1.35rem, 5vw, 2rem) on host; slightly smaller on phones
- **Buttons:** Nunito 700–800, pill shape, 48px min touch target
- **Emoji decorations:** ${emoji} as host decoration with \`host-pop\` animation on phase entry

---

## Host Screen

### Lobby
- Room code banner with glow pulse; player chips pop in staggered (60ms)
- Selected game card shows large emoji, title in display font, Start button with rocket icon
- **Animation:** \`bounce-in\` on game card; chips use \`chip-pop\`

### Prompt
- Phase label in accent color; ${hostName} emoji wiggles
- Prompt slides up inside \`prompt-card\` with glow border
- **Sound:** \`prompt\` chime (host only)

### Input
- ${arch.hostAnim}
- Submission tracker dots fill green as players submit
- **Sound:** soft \`submit\` blip per player completion

### Reveal
- Entries stagger \`slide-up\` 80ms apart
- Drawing entries get rounded frame; text entries bold weight
- **Sound:** \`reveal\` chord

### Vote
- "Players are voting" card; optional split-screen preview for pairs
- **Sound:** \`vote\` tone

### Results
- Correct answer in success green; "Round complete!" bounces in
- Leaderboard rows cascade with delay
- **Sound:** \`correct\` stinger

### Ended
- Confetti burst (40 pieces); winner banner with crown on #1
- **Sound:** \`winner\` fanfare

---

## Player Phone

### Lobby
- "You're in!" label; room code prominent; waiting message
- Player chips animate in — no sounds on client

### Prompt
- \`prompt-card\` with get-ready label; read prompt before input opens

### Input
- ${arch.clientUI}
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
| Player joins | \`join\` |
| Phase change | \`phase\` |
| Prompt shown | \`prompt\` |
| Player submits | \`submit\` |
| Reveal | \`reveal\` |
| Vote phase | \`vote\` |
| Round results | \`correct\` |
| Timer < 25% | \`timer-urgent\` |
| Game over | \`winner\` |
| Game selected | \`select\` |

${arch.sounds}

---

## Micro-interactions

1. **Phase transitions** — content exits with fade; new phase enters with archetype-appropriate animation (${archetype === 'trivia-bool' ? 'fly-in for statements' : 'slide-up default'})
2. **Timer** — bar drains with accent gradient; urgent state shakes count and pulses bar
3. **Buttons** — scale 0.94 on press with spring easing
4. **Game theme header** — emoji wiggle loop; host name in muted caps
5. **Scroll** — sticky nav with blurred game-tinted background during play

---

## Accessibility Notes

- Minimum 4.5:1 contrast on text; timer also shown numerically
- \`aria-live\` on timer; decorative emoji marked \`aria-hidden\`
- Reduced motion: respect \`prefers-reduced-motion\` (future — disable confetti/wiggle)
`;

  fs.writeFileSync(path.join(OUT, `${id}.md`), doc);
}

// Update MASTER_DESIGN links section
const masterPath = path.join(ROOT, 'ui-design-docs', 'MASTER_DESIGN.md');
let master = fs.readFileSync(masterPath, 'utf8');
const links = games.map((g) => `- [${g['Game Title']}](games/${g.id}.md)`).join('\n');
if (master.includes('## Per-Game UI Documents')) {
  master = master.replace(/## Per-Game UI Documents[\s\S]*$/, `## Per-Game UI Documents\n\n${links}\n`);
} else {
  master += `\n\n## Per-Game UI Documents\n\n${links}\n`;
}
fs.writeFileSync(masterPath, master);

console.log(`Generated ${games.length} game UI docs in ui-design-docs/games/`);