#!/usr/bin/env python3
"""Generate client/src/data/gameThemes.ts with Jackbox-inspired visuals per game."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GAMES = json.loads((ROOT / "shared" / "games.json").read_text(encoding="utf-8"))
DISABLED = {"earwax", "hear-say", "dodo-re-mi"}

# Jackbox-inspired accent colors + host mascots (emoji stand-ins for art)
THEMES = {
    "lie-swatter": {"accent": "#84cc16", "bg": "#1a2e05", "emoji": "🪰", "host": "Fly Guy", "pattern": "flies"},
    "word-spud": {"accent": "#f97316", "bg": "#2a1508", "emoji": "🥔", "host": "Word Spud", "pattern": "quips"},
    "fibbage-4": {"accent": "#3b82f6", "bg": "#0c1929", "emoji": "🎭", "host": "Cookie Masterson", "pattern": "fibbage"},
    "quiplash-3": {"accent": "#f97316", "bg": "#2a1508", "emoji": "💬", "host": "Schmitty", "pattern": "quips"},
    "drawful-animate": {"accent": "#a855f7", "bg": "#1e1033", "emoji": "✏️", "host": "Drawful", "pattern": "canvas"},
    "dirty-drawful": {"accent": "#ec4899", "bg": "#2a0a18", "emoji": "🔞", "host": "Drawful", "pattern": "canvas"},
    "trivia-murder-party-2": {"accent": "#dc2626", "bg": "#1a0505", "emoji": "💀", "host": "Death", "pattern": "murder"},
    "fakin-it": {"accent": "#eab308", "bg": "#1f1a05", "emoji": "🎪", "host": "Cookie", "pattern": "carnival"},
    "fakin-it-all-night-long": {"accent": "#eab308", "bg": "#1f1a05", "emoji": "🌙", "host": "Cookie", "pattern": "carnival"},
    "guesspionage": {"accent": "#06b6d4", "bg": "#051f24", "emoji": "🕵️", "host": "Foxy", "pattern": "spy"},
    "bidiots": {"accent": "#22c55e", "bg": "#052e16", "emoji": "🎨", "host": "Art Dealer", "pattern": "auction"},
    "bomb-corp": {"accent": "#ef4444", "bg": "#2a0a0a", "emoji": "💣", "host": "Greg", "pattern": "office"},
    "time-jinx": {"accent": "#8b5cf6", "bg": "#150d2e", "emoji": "⏳", "host": "Jerri Rig", "pattern": "time"},
    "tee-k-o-2": {"accent": "#f43f5e", "bg": "#2a0812", "emoji": "👕", "host": "Tee K.O.", "pattern": "bracket"},
    "let-me-finish": {"accent": "#14b8a6", "bg": "#052824", "emoji": "🎤", "host": "Tyler", "pattern": "debate"},
    "bracketeering": {"accent": "#f59e0b", "bg": "#1f1505", "emoji": "🏆", "host": "Bobbin", "pattern": "bracket"},
    "civic-doodle": {"accent": "#a855f7", "bg": "#1a1028", "emoji": "🏛️", "host": "Mayor", "pattern": "canvas"},
    "monster-seeking-monster": {"accent": "#8b5cf6", "bg": "#150d2e", "emoji": "👾", "host": "Dating Host", "pattern": "monsters"},
    "survive-the-internet": {"accent": "#0ea5e9", "bg": "#051f2e", "emoji": "🌐", "host": "Moxie", "pattern": "internet"},
    "mad-verse-city": {"accent": "#f43f5e", "bg": "#2a0812", "emoji": "🎤", "host": "MC", "pattern": "rap"},
    "patently-stupid": {"accent": "#22d3ee", "bg": "#052028", "emoji": "💡", "host": "Patent Office", "pattern": "patent"},
    "split-the-room": {"accent": "#eab308", "bg": "#1f1a05", "emoji": "🦉", "host": "Mayonnaise", "pattern": "split"},
    "you-don-t-know-jack-full-stream": {"accent": "#6366f1", "bg": "#12122a", "emoji": "❓", "host": "Buzz", "pattern": "trivia"},
    "zeeple-dome": {"accent": "#22c55e", "bg": "#052e16", "emoji": "👽", "host": "Zeeps", "pattern": "aliens"},
    "dictionarium": {"accent": "#f97316", "bg": "#2a1508", "emoji": "📖", "host": "Lexicon", "pattern": "dictionary"},
    "joke-boat": {"accent": "#38bdf8", "bg": "#051f2e", "emoji": "⛵", "host": "Captain", "pattern": "boat"},
    "push-the-button": {"accent": "#ef4444", "bg": "#2a0a0a", "emoji": "🚀", "host": "Ship AI", "pattern": "spaceship"},
    "role-models": {"accent": "#ec4899", "bg": "#2a0a18", "emoji": "🎭", "host": "Host", "pattern": "party"},
    "blather-round": {"accent": "#a78bfa", "bg": "#1a1028", "emoji": "🦉", "host": "Owl", "pattern": "wordchain"},
    "champ-d-up": {"accent": "#f43f5e", "bg": "#2a0812", "emoji": "🦸", "host": "Champ", "pattern": "canvas"},
    "talking-points": {"accent": "#14b8a6", "bg": "#052824", "emoji": "📺", "host": "Anchor", "pattern": "debate"},
    "the-devils-and-the-details": {"accent": "#dc2626", "bg": "#1a0505", "emoji": "😈", "host": "Devils", "pattern": "team"},
    "job-job": {"accent": "#64748b", "bg": "#0f172a", "emoji": "💼", "host": "HR", "pattern": "office"},
    "the-poll-mine": {"accent": "#78716c", "bg": "#1c1917", "emoji": "⛏️", "host": "Foreman", "pattern": "mine"},
    "the-wheel-of-enormous-proportions": {"accent": "#f59e0b", "bg": "#1f1505", "emoji": "🎡", "host": "Wheel Host", "pattern": "wheel"},
    "weapons-drawn": {"accent": "#ef4444", "bg": "#2a0a0a", "emoji": "🗡️", "host": "Sensei", "pattern": "ninja"},
    "junktopia": {"accent": "#84cc16", "bg": "#1a2e05", "emoji": "🗑️", "host": "Junk Lord", "pattern": "junk"},
    "nonsensory": {"accent": "#c084fc", "bg": "#1a1028", "emoji": "👃", "host": "Sense Host", "pattern": "senses"},
    "quixort": {"accent": "#6366f1", "bg": "#12122a", "emoji": "📚", "host": "Librarian", "pattern": "sort"},
    "roomerang": {"accent": "#f97316", "bg": "#2a1508", "emoji": "🪃", "host": "Boomerang", "pattern": "boomerang"},
    "fixy-text": {"accent": "#22d3ee", "bg": "#052028", "emoji": "📱", "host": "Glitch", "pattern": "glitch"},
    "hypnotorious": {"accent": "#a855f7", "bg": "#1a1028", "emoji": "🌀", "host": "Hypnotist", "pattern": "hypno"},
    "doominate": {"accent": "#dc2626", "bg": "#1a0505", "emoji": "👑", "host": "Overlord", "pattern": "dominate"},
    "cookie-haus": {"accent": "#f59e0b", "bg": "#1f1505", "emoji": "🍪", "host": "Cookie", "pattern": "cookie"},
    "suspectives": {"accent": "#06b6d4", "bg": "#051f24", "emoji": "🔍", "host": "Detective", "pattern": "mystery"},
    "legends-of-trivia": {"accent": "#f59e0b", "bg": "#1f1505", "emoji": "🏅", "host": "Legend", "pattern": "trivia"},
}

DEFAULT_BY_TYPE = {
    "Trivia": {"accent": "#6366f1", "bg": "#12122a", "emoji": "❓", "host": "Host", "pattern": "trivia"},
    "Drawing": {"accent": "#a855f7", "bg": "#1a1028", "emoji": "🖌️", "host": "Host", "pattern": "canvas"},
    "Writing": {"accent": "#f97316", "bg": "#2a1508", "emoji": "✍️", "host": "Host", "pattern": "quips"},
    "Fill-In-The-Blank": {"accent": "#3b82f6", "bg": "#0c1929", "emoji": "📝", "host": "Host", "pattern": "fibbage"},
    "Hidden Identity": {"accent": "#eab308", "bg": "#1f1a05", "emoji": "🎭", "host": "Host", "pattern": "mystery"},
    "Teamwork": {"accent": "#22c55e", "bg": "#052e16", "emoji": "🤝", "host": "Host", "pattern": "team"},
    "Other": {"accent": "#ec4899", "bg": "#2a0a18", "emoji": "🎉", "host": "Host", "pattern": "party"},
    "Roleplay": {"accent": "#8b5cf6", "bg": "#150d2e", "emoji": "👾", "host": "Host", "pattern": "monsters"},
}


def theme_for(g):
    gid = g["id"]
    if gid in THEMES:
        t = THEMES[gid]
    else:
        t = DEFAULT_BY_TYPE.get(g["Game Type"], DEFAULT_BY_TYPE["Other"])
    return {
        "id": gid,
        "title": g["Game Title"],
        "accent": t["accent"],
        "background": t["bg"],
        "emoji": t["emoji"],
        "hostName": t["host"],
        "pattern": t["pattern"],
        "pack": g["Game Pack"],
    }


def main():
    themes = [theme_for(g) for g in GAMES if g["id"] not in DISABLED]
    lines = [
        "/** Jackbox-inspired per-game visuals. Emoji stand in for licensed art. */",
        "export interface GameTheme {",
        "  id: string; title: string; accent: string; background: string;",
        "  emoji: string; hostName: string; pattern: string; pack: string;",
        "}",
        "export const GAME_THEMES: Record<string, GameTheme> = {",
    ]
    for t in themes:
        lines.append(f"  '{t['id']}': {json.dumps(t, ensure_ascii=False)},")
    lines.append("};")
    lines.append("")
    lines.append("export function getGameTheme(gameId: string | null): GameTheme | null {")
    lines.append("  if (!gameId) return null;")
    lines.append("  return GAME_THEMES[gameId] ?? null;")
    lines.append("}")
    out = ROOT / "client" / "src" / "data" / "gameThemes.ts"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {len(themes)} themes to {out}")


if __name__ == "__main__":
    main()