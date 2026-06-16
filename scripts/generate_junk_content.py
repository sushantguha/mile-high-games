#!/usr/bin/env python3
"""Generate JUNK test content per game — safe to delete later (see content/junk/README.txt)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GAMES = json.loads((ROOT / "shared" / "games.json").read_text(encoding="utf-8"))
OUT = ROOT / "content" / "junk"
DISABLED = {"earwax", "hear-say", "dodo-re-mi"}

ARCHETYPE = {
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


def junk_prompts(title: str, arch: str, n: int = 8) -> list:
    base = f"[JUNK] {title}"
    if arch == "trivia-bool":
        return [{"text": f"{base} statement {i}: testing true or lie.", "isTrue": i % 2 == 0} for i in range(1, n + 1)]
    if arch == "fibbage":
        return [{"prompt": f"{base} fill-in #{i}: The capital of Testland is ____.", "truth": f"Junkville-{i}"} for i in range(1, n + 1)]
    if arch == "trivia":
        return [{"question": f"{base} trivia Q{i}?", "answer": f"Answer{i}", "distractors": [f"Wrong{i}a", f"Wrong{i}b", f"Wrong{i}c"]} for i in range(1, n + 1)]
    return [f"{base} prompt #{i} — placeholder for {arch} gameplay." for i in range(1, n + 1)]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "README.txt").write_text(
        "JUNK TEST DATA — DELETE THIS ENTIRE FOLDER WHEN REAL CONTENT IS READY.\n"
        "All JSON files have _junk: true and are merged into content pools at runtime.\n",
        encoding="utf-8",
    )
    index = {}
    for g in GAMES:
        gid = g["id"]
        if gid in DISABLED:
            continue
        arch = ARCHETYPE.get(gid, "write-vote")
        data = {
            "_junk": True,
            "_note": "DELETE LATER — synthetic test prompts only",
            "gameId": gid,
            "title": g["Game Title"],
            "archetype": arch,
            "prompts": junk_prompts(g["Game Title"], arch),
        }
        path = OUT / f"{gid}.json"
        path.write_text(json.dumps(data, indent=2), encoding="utf-8")
        index[gid] = str(path.relative_to(ROOT))
    (OUT / "_index.json").write_text(json.dumps(index, indent=2), encoding="utf-8")
    print(f"Wrote {len(index)} junk content files to {OUT}")


if __name__ == "__main__":
    main()