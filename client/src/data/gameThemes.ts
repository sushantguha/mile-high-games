/** Jackbox-inspired per-game visuals. Emoji stand in for licensed art. */
export interface GameTheme {
  id: string; title: string; accent: string; background: string;
  emoji: string; hostName: string; pattern: string; pack: string;
}
export const GAME_THEMES: Record<string, GameTheme> = {
  'lie-swatter': {"id": "lie-swatter", "title": "Lie Swatter", "accent": "#84cc16", "background": "#1a2e05", "emoji": "🪰", "hostName": "Fly Guy", "pattern": "flies", "pack": "Jackbox Party Pack 1"},
  'word-spud': {"id": "word-spud", "title": "Word Spud", "accent": "#f97316", "background": "#2a1508", "emoji": "🥔", "hostName": "Word Spud", "pattern": "quips", "pack": "Jackbox Party Pack 1"},
  'bidiots': {"id": "bidiots", "title": "Bidiots", "accent": "#22c55e", "background": "#052e16", "emoji": "🎨", "hostName": "Art Dealer", "pattern": "auction", "pack": "Jackbox Party Pack 2"},
  'bomb-corp': {"id": "bomb-corp", "title": "Bomb Corp.", "accent": "#ef4444", "background": "#2a0a0a", "emoji": "💣", "hostName": "Greg", "pattern": "office", "pack": "Jackbox Party Pack 2"},
  'fakin-it': {"id": "fakin-it", "title": "Fakin' It!", "accent": "#eab308", "background": "#1f1a05", "emoji": "🎪", "hostName": "Cookie", "pattern": "carnival", "pack": "Jackbox Party Pack 3"},
  'guesspionage': {"id": "guesspionage", "title": "Guesspionage", "accent": "#06b6d4", "background": "#051f24", "emoji": "🕵️", "hostName": "Foxy", "pattern": "spy", "pack": "Jackbox Party Pack 3"},
  'bracketeering': {"id": "bracketeering", "title": "Bracketeering", "accent": "#f59e0b", "background": "#1f1505", "emoji": "🏆", "hostName": "Bobbin", "pattern": "bracket", "pack": "Jackbox Party Pack 4"},
  'civic-doodle': {"id": "civic-doodle", "title": "Civic Doodle", "accent": "#a855f7", "background": "#1a1028", "emoji": "🏛️", "hostName": "Mayor", "pattern": "canvas", "pack": "Jackbox Party Pack 4"},
  'monster-seeking-monster': {"id": "monster-seeking-monster", "title": "Monster Seeking Monster", "accent": "#8b5cf6", "background": "#150d2e", "emoji": "👾", "hostName": "Dating Host", "pattern": "monsters", "pack": "Jackbox Party Pack 4"},
  'survive-the-internet': {"id": "survive-the-internet", "title": "Survive the Internet", "accent": "#0ea5e9", "background": "#051f2e", "emoji": "🌐", "hostName": "Moxie", "pattern": "internet", "pack": "Jackbox Party Pack 4"},
  'mad-verse-city': {"id": "mad-verse-city", "title": "Mad Verse City", "accent": "#f43f5e", "background": "#2a0812", "emoji": "🎤", "hostName": "MC", "pattern": "rap", "pack": "Jackbox Party Pack 5"},
  'patently-stupid': {"id": "patently-stupid", "title": "Patently Stupid", "accent": "#22d3ee", "background": "#052028", "emoji": "💡", "hostName": "Patent Office", "pattern": "patent", "pack": "Jackbox Party Pack 5"},
  'split-the-room': {"id": "split-the-room", "title": "Split the Room", "accent": "#eab308", "background": "#1f1a05", "emoji": "🦉", "hostName": "Mayonnaise", "pattern": "split", "pack": "Jackbox Party Pack 5"},
  'you-don-t-know-jack-full-stream': {"id": "you-don-t-know-jack-full-stream", "title": "You Don't Know Jack Full Stream", "accent": "#6366f1", "background": "#12122a", "emoji": "❓", "hostName": "Buzz", "pattern": "trivia", "pack": "Jackbox Party Pack 5"},
  'zeeple-dome': {"id": "zeeple-dome", "title": "Zeeple Dome", "accent": "#22c55e", "background": "#052e16", "emoji": "👽", "hostName": "Zeeps", "pattern": "aliens", "pack": "Jackbox Party Pack 5"},
  'dictionarium': {"id": "dictionarium", "title": "Dictionarium", "accent": "#f97316", "background": "#2a1508", "emoji": "📖", "hostName": "Lexicon", "pattern": "dictionary", "pack": "Jackbox Party Pack 6"},
  'joke-boat': {"id": "joke-boat", "title": "Joke Boat", "accent": "#38bdf8", "background": "#051f2e", "emoji": "⛵", "hostName": "Captain", "pattern": "boat", "pack": "Jackbox Party Pack 6"},
  'push-the-button': {"id": "push-the-button", "title": "Push the Button", "accent": "#ef4444", "background": "#2a0a0a", "emoji": "🚀", "hostName": "Ship AI", "pattern": "spaceship", "pack": "Jackbox Party Pack 6"},
  'role-models': {"id": "role-models", "title": "Role Models", "accent": "#ec4899", "background": "#2a0a18", "emoji": "🎭", "hostName": "Host", "pattern": "party", "pack": "Jackbox Party Pack 6"},
  'trivia-murder-party-2': {"id": "trivia-murder-party-2", "title": "Trivia Murder Party 2", "accent": "#dc2626", "background": "#1a0505", "emoji": "💀", "hostName": "Death", "pattern": "murder", "pack": "Jackbox Party Pack 6"},
  'blather-round': {"id": "blather-round", "title": "Blather 'Round", "accent": "#a78bfa", "background": "#1a1028", "emoji": "🦉", "hostName": "Owl", "pattern": "wordchain", "pack": "Jackbox Party Pack 7"},
  'champ-d-up': {"id": "champ-d-up", "title": "Champ'd Up", "accent": "#f43f5e", "background": "#2a0812", "emoji": "🦸", "hostName": "Champ", "pattern": "canvas", "pack": "Jackbox Party Pack 7"},
  'quiplash-3': {"id": "quiplash-3", "title": "Quiplash 3", "accent": "#f97316", "background": "#2a1508", "emoji": "💬", "hostName": "Schmitty", "pattern": "quips", "pack": "Jackbox Party Pack 7"},
  'talking-points': {"id": "talking-points", "title": "Talking Points", "accent": "#14b8a6", "background": "#052824", "emoji": "📺", "hostName": "Anchor", "pattern": "debate", "pack": "Jackbox Party Pack 7"},
  'the-devils-and-the-details': {"id": "the-devils-and-the-details", "title": "The Devils and the Details", "accent": "#dc2626", "background": "#1a0505", "emoji": "😈", "hostName": "Devils", "pattern": "team", "pack": "Jackbox Party Pack 7"},
  'drawful-animate': {"id": "drawful-animate", "title": "Drawful Animate", "accent": "#a855f7", "background": "#1e1033", "emoji": "✏️", "hostName": "Drawful", "pattern": "canvas", "pack": "Jackbox Party Pack 8"},
  'job-job': {"id": "job-job", "title": "Job Job", "accent": "#64748b", "background": "#0f172a", "emoji": "💼", "hostName": "HR", "pattern": "office", "pack": "Jackbox Party Pack 8"},
  'the-poll-mine': {"id": "the-poll-mine", "title": "The Poll Mine", "accent": "#78716c", "background": "#1c1917", "emoji": "⛏️", "hostName": "Foreman", "pattern": "mine", "pack": "Jackbox Party Pack 8"},
  'the-wheel-of-enormous-proportions': {"id": "the-wheel-of-enormous-proportions", "title": "The Wheel of Enormous Proportions", "accent": "#f59e0b", "background": "#1f1505", "emoji": "🎡", "hostName": "Wheel Host", "pattern": "wheel", "pack": "Jackbox Party Pack 8"},
  'weapons-drawn': {"id": "weapons-drawn", "title": "Weapons Drawn", "accent": "#ef4444", "background": "#2a0a0a", "emoji": "🗡️", "hostName": "Sensei", "pattern": "ninja", "pack": "Jackbox Party Pack 8"},
  'fibbage-4': {"id": "fibbage-4", "title": "Fibbage 4", "accent": "#3b82f6", "background": "#0c1929", "emoji": "🎭", "hostName": "Cookie Masterson", "pattern": "fibbage", "pack": "Jackbox Party Pack 9"},
  'junktopia': {"id": "junktopia", "title": "Junktopia", "accent": "#84cc16", "background": "#1a2e05", "emoji": "🗑️", "hostName": "Junk Lord", "pattern": "junk", "pack": "Jackbox Party Pack 9"},
  'nonsensory': {"id": "nonsensory", "title": "Nonsensory", "accent": "#c084fc", "background": "#1a1028", "emoji": "👃", "hostName": "Sense Host", "pattern": "senses", "pack": "Jackbox Party Pack 9"},
  'quixort': {"id": "quixort", "title": "Quixort", "accent": "#6366f1", "background": "#12122a", "emoji": "📚", "hostName": "Librarian", "pattern": "sort", "pack": "Jackbox Party Pack 9"},
  'roomerang': {"id": "roomerang", "title": "Roomerang", "accent": "#f97316", "background": "#2a1508", "emoji": "🪃", "hostName": "Boomerang", "pattern": "boomerang", "pack": "Jackbox Party Pack 9"},
  'fixy-text': {"id": "fixy-text", "title": "Fixy Text", "accent": "#22d3ee", "background": "#052028", "emoji": "📱", "hostName": "Glitch", "pattern": "glitch", "pack": "Jackbox Party Pack 10"},
  'hypnotorious': {"id": "hypnotorious", "title": "Hypnotorious", "accent": "#a855f7", "background": "#1a1028", "emoji": "🌀", "hostName": "Hypnotist", "pattern": "hypno", "pack": "Jackbox Party Pack 10"},
  'tee-k-o-2': {"id": "tee-k-o-2", "title": "Tee K.O. 2", "accent": "#f43f5e", "background": "#2a0812", "emoji": "👕", "hostName": "Tee K.O.", "pattern": "bracket", "pack": "Jackbox Party Pack 10"},
  'time-jinx': {"id": "time-jinx", "title": "Time Jinx", "accent": "#8b5cf6", "background": "#150d2e", "emoji": "⏳", "hostName": "Jerri Rig", "pattern": "time", "pack": "Jackbox Party Pack 10"},
  'doominate': {"id": "doominate", "title": "Doominate", "accent": "#dc2626", "background": "#1a0505", "emoji": "👑", "hostName": "Overlord", "pattern": "dominate", "pack": "Jackbox Party Pack 11"},
  'cookie-haus': {"id": "cookie-haus", "title": "Cookie Haus", "accent": "#f59e0b", "background": "#1f1505", "emoji": "🍪", "hostName": "Cookie", "pattern": "cookie", "pack": "Jackbox Party Pack 11"},
  'suspectives': {"id": "suspectives", "title": "Suspectives", "accent": "#06b6d4", "background": "#051f24", "emoji": "🔍", "hostName": "Detective", "pattern": "mystery", "pack": "Jackbox Party Pack 11"},
  'legends-of-trivia': {"id": "legends-of-trivia", "title": "Legends of Trivia", "accent": "#f59e0b", "background": "#1f1505", "emoji": "🏅", "hostName": "Legend", "pattern": "trivia", "pack": "Jackbox Party Pack 11"},
  'fakin-it-all-night-long': {"id": "fakin-it-all-night-long", "title": "Fakin' It All Night Long", "accent": "#eab308", "background": "#1f1a05", "emoji": "🌙", "hostName": "Cookie", "pattern": "carnival", "pack": "The Jackbox Naughty Pack"},
  'dirty-drawful': {"id": "dirty-drawful", "title": "Dirty Drawful", "accent": "#ec4899", "background": "#2a0a18", "emoji": "🔞", "hostName": "Drawful", "pattern": "canvas", "pack": "The Jackbox Naughty Pack"},
  'let-me-finish': {"id": "let-me-finish", "title": "Let Me Finish", "accent": "#14b8a6", "background": "#052824", "emoji": "🎤", "hostName": "Tyler", "pattern": "debate", "pack": "The Jackbox Naughty Pack"},
};

export function getGameTheme(gameId: string | null): GameTheme | null {
  if (!gameId) return null;
  return GAME_THEMES[gameId] ?? null;
}
