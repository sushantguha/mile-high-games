#!/usr/bin/env python3
"""Generate gameRules.ts overrides from games.json and wiki_raw summaries."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GAMES = json.loads((ROOT / "shared" / "games.json").read_text(encoding="utf-8"))
DISABLED = {"earwax", "hear-say", "dodo-re-mi"}

# Wiki-aligned overrides per game id
OVERRIDES: dict[str, dict] = {
    "lie-swatter": {
        "totalRounds": 3, "subRoundsPerRound": 7, "inputTimeMs": 20000,
        "speedBonus": 75, "finalRoundMultiplier": 2,
        "correctPointsMin": 100, "correctPointsMax": 150, "incorrectPoints": 0,
    },
    "fibbage-4": {"totalRounds": 3, "inputTimeMs": 30000, "voteTimeMs": 30000},
    "quiplash-3": {"totalRounds": 3, "inputTimeMs": 30000, "voteTimeMs": 25000},
    "guesspionage": {"inputTimeMs": 25000, "subRoundsPerRound": 5},
    "time-jinx": {"totalRounds": 3, "subRoundsPerRound": 5, "inputTimeMs": 25000},
    "trivia-murder-party-2": {"totalRounds": 5, "inputTimeMs": 20000, "resultsTimeMs": 15000, "promptTimeMs": 5000},
    "bracketeering": {"totalRounds": 1, "subRoundsPerRound": 7, "voteTimeMs": 20000},
    "word-spud": {"totalRounds": 3, "subRoundsPerRound": 1, "inputTimeMs": 25000},
    "blather-round": {"totalRounds": 3, "inputTimeMs": 30000},
    "bomb-corp": {"totalRounds": 1, "inputTimeMs": 60000, "promptTimeMs": 5000},
    "fakin-it": {"totalRounds": 4, "inputTimeMs": 20000},
    "fakin-it-all-night-long": {"totalRounds": 5, "inputTimeMs": 20000},
    "drawful-animate": {"totalRounds": 3, "inputTimeMs": 90000, "voteTimeMs": 30000},
    "dirty-drawful": {"totalRounds": 3, "inputTimeMs": 90000, "voteTimeMs": 30000},
    "tee-k-o-2": {"totalRounds": 1, "subRoundsPerRound": 7, "inputTimeMs": 90000, "voteTimeMs": 30000, "revealTimeMs": 5000},
    "let-me-finish": {"totalRounds": 4, "inputTimeMs": 45000, "voteTimeMs": 30000},
}

ARCHETYPE_DEFAULTS = {
    "trivia-bool": {"correctPointsMin": 500, "correctPointsMax": 500, "incorrectPoints": -200},
    "draw-guess": {"inputTimeMs": 90000, "voteTimeMs": 30000, "revealTimeMs": 5000},
    "draw-bracket": {"inputTimeMs": 90000, "voteTimeMs": 30000, "revealTimeMs": 5000},
    "write-vote": {"inputTimeMs": 30000, "voteTimeMs": 25000, "revealTimeMs": 4000},
    "fibbage": {"inputTimeMs": 30000, "voteTimeMs": 30000, "revealTimeMs": 5000, "totalRounds": 3},
    "word-chain": {"inputTimeMs": 30000, "voteTimeMs": 25000, "revealTimeMs": 4000},
    "text-transform": {"inputTimeMs": 30000, "voteTimeMs": 25000, "revealTimeMs": 4000},
    "pitch": {"inputTimeMs": 30000, "voteTimeMs": 25000, "revealTimeMs": 4000},
    "finish-sentence": {"inputTimeMs": 45000, "voteTimeMs": 30000, "revealTimeMs": 4000},
    "debate": {"inputTimeMs": 30000, "voteTimeMs": 25000, "revealTimeMs": 4000},
    "bracket": {"inputTimeMs": 30000, "voteTimeMs": 20000, "revealTimeMs": 4000},
    "hidden-task": {"inputTimeMs": 20000, "totalRounds": 4},
    "teamwork": {"inputTimeMs": 45000},
    "trivia": {"inputTimeMs": 20000, "resultsTimeMs": 15000, "promptTimeMs": 5000},
    "survival-trivia": {"inputTimeMs": 20000, "totalRounds": 5, "resultsTimeMs": 15000, "promptTimeMs": 5000},
    "rank": {"inputTimeMs": 30000},
    "sort": {"inputTimeMs": 30000},
    "role-label": {"inputTimeMs": 20000},
}

# Import archetype map from registry manually
ARCHETYPE_MAP = {
    "lie-swatter": "trivia-bool", "word-spud": "word-chain", "bidiots": "draw-guess",
    "bomb-corp": "teamwork", "fakin-it": "hidden-task", "guesspionage": "trivia",
    "bracketeering": "bracket", "civic-doodle": "draw-guess", "monster-seeking-monster": "hidden-task",
    "survive-the-internet": "text-transform", "mad-verse-city": "write-vote", "patently-stupid": "draw-guess",
    "split-the-room": "rank", "you-don-t-know-jack-full-stream": "trivia", "zeeple-dome": "teamwork",
    "dictionarium": "write-vote", "joke-boat": "write-vote", "push-the-button": "hidden-task",
    "role-models": "role-label", "trivia-murder-party-2": "survival-trivia", "blather-round": "word-chain",
    "champ-d-up": "draw-guess", "quiplash-3": "write-vote", "talking-points": "debate",
    "the-devils-and-the-details": "teamwork", "drawful-animate": "draw-guess", "job-job": "write-vote",
    "the-poll-mine": "rank", "the-wheel-of-enormous-proportions": "trivia", "weapons-drawn": "draw-guess",
    "fibbage-4": "fibbage", "junktopia": "pitch", "nonsensory": "write-vote", "quixort": "sort",
    "roomerang": "pitch", "fixy-text": "text-transform", "hypnotorious": "hidden-task",
    "tee-k-o-2": "draw-bracket", "time-jinx": "trivia", "doominate": "write-vote",
    "cookie-haus": "draw-guess", "suspectives": "hidden-task", "legends-of-trivia": "trivia",
    "fakin-it-all-night-long": "hidden-task", "dirty-drawful": "draw-guess", "let-me-finish": "finish-sentence",
}

def ts_entry(gid: str, rules: dict) -> str:
    parts = [f"  '{gid}': {{"]
    for k, v in rules.items():
        parts.append(f"    {k}: {json.dumps(v)},")
    parts.append("  },")
    return "\n".join(parts)


def main():
    entries = []
    for g in GAMES:
        gid = g["id"]
        if gid in DISABLED:
            continue
        rules = {}
        arch = ARCHETYPE_MAP.get(gid, "write-vote")
        if arch in ARCHETYPE_DEFAULTS:
            rules.update(ARCHETYPE_DEFAULTS[arch])
        if gid in OVERRIDES:
            rules.update(OVERRIDES[gid])
        if rules:
            entries.append(ts_entry(gid, rules))
    out = ROOT / "server" / "src" / "games" / "gameRules.generated.ts"
    content = "// AUTO-GENERATED — run scripts/generate_game_rules.py\nexport const GENERATED_GAME_RULES = {\n" + "\n".join(entries) + "} as const;\n"
    out.write_text(content, encoding="utf-8")
    print(f"Wrote {len(entries)} rule entries to {out}")


if __name__ == "__main__":
    main()