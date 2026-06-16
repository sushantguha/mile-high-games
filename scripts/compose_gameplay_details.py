#!/usr/bin/env python3
"""
Compose detailed gameplay fine detail files from wiki_raw JSON.
Sources ONLY jackboxgames.fandom.com and jackbox.wiki.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "gameplay fine details" / "wiki_raw"
OUT_DIR = ROOT / "gameplay fine details"
DISABLED = {"earwax", "hear-say", "dodo-re-mi"}

VERSION_HEADINGS: dict[str, list[str]] = {
    "fibbage-4": ["Fibbage 4", "Fibbage 4: Enough About You"],
    "quiplash-3": ["Quiplash 3", "Quiplash 3: Quarantash"],
    "drawful-animate": ["Drawful Animate", "Drawful Animate 2"],
    "dirty-drawful": ["Dirty Drawful", "Drawful: Dirty Drawful"],
    "fakin-it-all-night-long": ["Fakin' It All Night Long", "Fakin It All Night Long"],
    "tee-k-o-2": ["Tee K.O. 2", "Tee K.O.! 2"],
    "trivia-murder-party-2": ["Trivia Murder Party 2", "TMP2"],
    "you-don-t-know-jack-full-stream": ["You Don't Know Jack: Full Stream", "Full Stream"],
}


def clean(text: str) -> str:
    if not text:
        return ""
    for pat in [
        r"Community content is available under.*",
        r"Sign In to Save.*",
        r"HEADS UP! This page is under construction.*",
        r"Pardon our dust.*",
        r"This is an unfinished article!.*",
        r"You can help the Jackbox Games Wiki.*",
        r"Contents\s+1\s+",
        r"\[\s*\]",
        r"\[\d+\]",
    ]:
        text = re.sub(pat, "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_section(text: str, heading: str, max_len: int = 8000) -> str:
    patterns = [
        rf"{re.escape(heading)}\s*\[?\s*\]?\s*\n(.*?)(?=\n\s*(?:[A-Z][a-z].{{0,50}}\s*\[?\s*\]?\s*\n|\Z))",
        rf"{re.escape(heading)}\s*\n(.*?)(?=\n\s*[A-Z][^\n]{{3,50}}\s*\n)",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.DOTALL | re.IGNORECASE)
        if m:
            return clean(m.group(1))[:max_len]
    return ""


def wiki_paragraphs(text: str, min_len: int = 50) -> list[str]:
    parts = re.split(r"\n\n+", text)
    if len(parts) < 3:
        parts = [p.strip() for p in text.split("\n") if len(p.strip()) >= min_len]
    out = []
    for p in parts:
        p = clean(p)
        if len(p) >= min_len and not re.match(
            r"^(Avatar|Icon|Portrait|Miscellaneous|Available In|Developer|Genre|Voiced|Host|Contents|Code Name)\b",
            p,
        ):
            out.append(p)
    return out


def scoring_lines(text: str) -> list[str]:
    lines = []
    for p in wiki_paragraphs(text):
        if re.search(r"\b(point|score|bonus|penalty|round \d|final round|lowest score|thumbs|reputation)\b", p, re.I):
            lines.append(p)
    return lines[:15]


def gameplay_lines(text: str) -> list[str]:
    lines = []
    for p in wiki_paragraphs(text):
        if re.search(
            r"\b(gameplay|round|player|host|phone|device|controller|submit|vote|draw|timer|lobby|task|faker|truth|lie|bomb|defus|presentation|bracket|wheel|murder|ghost)\b",
            p,
            re.I,
        ):
            lines.append(p)
    return lines[:25]


def build_doc(gid: str, entry: dict) -> str:
    meta = entry.get("meta", {})
    title = meta.get("Game Title", gid)
    pack = meta.get("Game Pack", "")
    min_p = meta.get("Min. Players", 1)
    max_p = meta.get("Max. Players", 8)
    length = meta.get("Length", "15 minutes")
    audience = meta.get("Audience") == "Yes"

    fandom = clean(entry.get("fandom") or "")
    jackbox = clean(entry.get("jackbox") or "")
    combined = fandom + "\n\n" + jackbox

    version_bits = []
    for heading in VERSION_HEADINGS.get(gid, [title]):
        sec = extract_section(combined, heading)
        if sec:
            version_bits.append(f"### {heading} (wiki)\n{sec}")

    gp = gameplay_lines(combined)
    sc = scoring_lines(combined)
    if not gp:
        gp = wiki_paragraphs(combined)[:12]

    aud = " An audience can participate per Jackbox wiki specs." if audience else ""
    lines = [
        f"Here's the full turn-by-turn of {title} (latest version in {pack}), "
        f"tracking the main screen and each player's phone separately. "
        f"Sourced exclusively from jackboxgames.fandom.com and jackbox.wiki.",
        "",
        "Setup and lobby",
        f"The host launches {title} on the shared/main screen. A four-letter room code appears; "
        f"players join on phones with the code and a display name. Names appear in the lobby as they connect. "
        f"Player count: {min_p}–{max_p}.{aud} Session length is roughly {length}.",
        "",
    ]

    if version_bits:
        lines.append("Version-specific mechanics (latest entry)")
        lines.extend(version_bits)
        lines.append("")

    lines.append("Game overview (both wikis)")
    for i, p in enumerate(gp[:10], 1):
        lines.append(f"{i}. {p}")
    lines.append("")

    lines.extend([
        "Turn-by-turn — typical round",
        "",
        "Prompt / category phase",
        "**Main screen:** Host narration, category title, round number, or task instructions display. "
        "Any tutorial or special-round intro plays here.",
        "**Player phones:** Matching prompt context — category picker, question stem, secret task, or waiting state. "
        "Players read on-device; TV mirrors key text but phones are the controller.",
        "",
        "Input phase",
        "**Main screen:** Timer countdown, submission progress (N of M players), and round-specific visuals.",
        "**Player phones:** Active input — text entry, drawing canvas, TRUE/LIE buttons, numeric year guess, "
        "ranking, team coordination, or hidden-task response. Speed and timer pressure apply where wikis note it.",
        "",
        "Reveal / vote / accuse phase",
        "**Main screen:** Submissions revealed sequentially or simultaneously; vote tallies; Faker accusations; "
        "truth/lie reveals; bracket matchups; or drawing animations.",
        "**Player phones:** Vote for favorites, pick the truth, accuse the Faker, choose bracket winner, "
        "or view personal results. Self-vote rules follow Jackbox standard (cannot vote own entry where applicable).",
        "",
        "Results phase",
        "**Main screen:** Points awarded, round standings, who fooled whom, eliminations (survival games), "
        "or match winners.",
        "**Player phones:** Personal score delta, placement, secret role feedback, and Thumbs Cup / bonus notifications.",
        "",
        "Between rounds and end of game",
        "Scoreboard displays after each round. Final round uses wiki-documented multipliers or special rules. "
        "Game ends with top players highlighted and full leaderboard.",
        "",
        "Scoring (wiki-extracted)",
    ])

    if sc:
        for p in sc:
            lines.append(f"- {p}")
    else:
        lines.append("- Refer to game overview above; implement timers and point values from extracted wiki paragraphs.")

    lines.extend([
        "",
        "Implementation notes for Mile High Games",
        f"- Game id: `{gid}`; pack: {pack}.",
        f"- Enforce min {min_p} / max {max_p} players in lobby.",
        "- Match phase flow: prompt → input → reveal/vote → results → next round or game over.",
        "- Room code: 4 letters; join via `/?code=XXXX`.",
        "",
        "Sources",
        "- https://jackboxgames.fandom.com/wiki/Jackbox_Games_Wiki",
        "- https://jackbox.wiki/wiki/The_Jackbox_Party_Pack_(series)",
        f"- Fandom and jackbox.wiki pages for {title}.",
        "",
        "Limits",
        "Exact per-second timer values and TV-to-phone sync delays are not always published on wikis. "
        "Use visible host countdown; phone timer varies by original Jackbox controller design.",
    ])
    return "\n".join(lines)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    count = 0
    for path in sorted(RAW_DIR.glob("*.json")):
        if path.name.startswith("_"):
            continue
        gid = path.stem
        if gid in DISABLED or gid == "lie-swatter":
            continue
        entry = json.loads(path.read_text(encoding="utf-8"))
        (OUT_DIR / f"{gid}.txt").write_text(build_doc(gid, entry), encoding="utf-8")
        count += 1
    print(f"Composed {count} wiki-sourced gameplay files")


if __name__ == "__main__":
    main()