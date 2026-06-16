#!/usr/bin/env python3
"""Fetch trivia from public APIs, merge curated generators, curate, and write JSON pools."""

from __future__ import annotations

import html
import json
import random
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from content_curated import (  # noqa: E402
    generate_synthetic_mc,
    generate_bracket,
    generate_debate,
    generate_draw_guess,
    generate_fibbage,
    generate_finish_sentence,
    generate_hidden_task,
    generate_pitch,
    generate_quiplash,
    generate_rank,
    generate_role_label,
    generate_shirt_designs,
    generate_sort,
    generate_teamwork,
    generate_text_transform,
    generate_true_or_lie,
    generate_word_chain,
)
from curate_content_pools import (  # noqa: E402
    dedupe_fibbage,
    dedupe_mc,
    dedupe_statements,
    dedupe_strings,
)

TARGET_MC = 2000
TARGET_BOOL = 300
TARGET_DRAW = 350
TARGET_SHIRT = 120
TARGET_QUIPLASH = 500
TARGET_FIBBAGE = 200

OPENTDB_CATEGORIES = list(range(9, 33))  # general + entertainment + science + etc.
DIFFICULTY_WEIGHTS = [("easy", 1), ("medium", 3), ("hard", 2)]

TRIVIA_API_CATEGORIES = [
    "history", "geography", "science", "sport_and_leisure",
    "arts_and_literature", "general_knowledge", "film_and_tv", "music",
    "food_and_drink", "society_and_culture",
]


def decode_text(s: str) -> str:
    s = html.unescape(s or "")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def fetch_json(url: str, retries: int = 3) -> dict | list | None:
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "MileHighGamesContentBot/1.0"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
            print(f"  fetch warn ({attempt + 1}/{retries}): {e}")
            time.sleep(1 + attempt)
    return None


def weighted_difficulty() -> str:
    choices, weights = zip(*DIFFICULTY_WEIGHTS)
    return random.choices(choices, weights=weights, k=1)[0]


def fetch_opentdb(existing: set[str], target: int) -> list[dict]:
    out: list[dict] = []
    session_token: str | None = None
    rounds = 0
    max_rounds = 120
    print("Fetching Open Trivia DB...")
    while len(out) < target and rounds < max_rounds:
        rounds += 1
        amount = min(50, target - len(out) + 20)
        cat = random.choice(OPENTDB_CATEGORIES)
        diff = weighted_difficulty()
        params = {"amount": amount, "type": "multiple", "category": cat, "difficulty": diff}
        if session_token:
            params["token"] = session_token
        url = "https://opentdb.com/api.php?" + urllib.parse.urlencode(params)
        data = fetch_json(url)
        if not data or data.get("response_code") != 0:
            if data and data.get("response_code") == 4 and not session_token:
                token_data = fetch_json("https://opentdb.com/api_token.php?command=request")
                if token_data and token_data.get("response_code") == 0:
                    session_token = token_data.get("token")
            time.sleep(0.4)
            continue
        for item in data.get("results", []):
            qtext = decode_text(item.get("question", ""))
            answer = decode_text(item.get("correct_answer", ""))
            distractors = [decode_text(d) for d in item.get("incorrect_answers", [])]
            key = qtext.lower()
            if key in existing:
                continue
            existing.add(key)
            out.append({"question": qtext, "answer": answer, "distractors": distractors})
        if rounds % 10 == 0:
            print(f"  OpenTDB: {len(out)} raw collected (round {rounds})")
        time.sleep(1.2)
    return out


def fetch_trivia_api(existing: set[str], target: int) -> list[dict]:
    out: list[dict] = []
    print("Fetching The Trivia API...")
    per_cat = max(30, target // len(TRIVIA_API_CATEGORIES) + 5)
    for cat in TRIVIA_API_CATEGORIES:
        if len(out) >= target:
            break
        url = (
            "https://the-trivia-api.com/api/questions?"
            + urllib.parse.urlencode({"categories": cat, "limit": min(per_cat, 50)})
        )
        data = fetch_json(url)
        if not isinstance(data, list):
            continue
        for item in data:
            qtext = decode_text(item.get("question", ""))
            answer = decode_text(item.get("correctAnswer", ""))
            distractors = [decode_text(d) for d in item.get("incorrectAnswers", [])]
            key = qtext.lower()
            if key in existing:
                continue
            existing.add(key)
            out.append({"question": qtext, "answer": answer, "distractors": distractors})
        print(f"  TriviaAPI {cat}: total {len(out)}")
        time.sleep(0.5)
    return out


def fetch_opentdb_offline(existing: set[str], target: int) -> list[dict]:
    """Fallback: bulk mirror on GitHub (no rate limit)."""
    print("Fetching OpenTDB offline mirror...")
    urls = [
        "https://gist.githubusercontent.com/jbaranski/5419c049af1989c1808a71bc73c9f3f4/raw/",
        "https://raw.githubusercontent.com/ubikry/opentdb-full/main/opentdb.json",
        "https://raw.githubusercontent.com/ubikry/opentdb-full/master/opentdb.json",
    ]
    data = None
    for url in urls:
        data = fetch_json(url)
        if isinstance(data, list) and data:
            break
    if not isinstance(data, list):
        print("  offline mirror unavailable")
        return []
    out: list[dict] = []
    random.shuffle(data)
    for item in data:
        if len(out) >= target:
            break
        qtext = decode_text(item.get("question", ""))
        answer = decode_text(item.get("correct_answer", item.get("correctAnswer", "")))
        distractors = [decode_text(d) for d in item.get("incorrect_answers", item.get("incorrectAnswers", []))]
        key = qtext.lower()
        if key in existing:
            continue
        existing.add(key)
        out.append({"question": qtext, "answer": answer, "distractors": distractors})
    print(f"  offline mirror: {len(out)} collected")
    return out


def build_mc_pool() -> list[dict]:
    existing: set[str] = set()
    raw: list[dict] = []
    raw.extend(fetch_opentdb(existing, TARGET_MC))
    if len(raw) < TARGET_MC:
        raw.extend(fetch_trivia_api(existing, TARGET_MC - len(raw)))
    if len(raw) < TARGET_MC:
        raw.extend(fetch_opentdb_offline(existing, TARGET_MC - len(raw)))
    curated = dedupe_mc(raw)
    print(f"MC trivia: {len(raw)} raw -> {len(curated)} curated")
    # If still short, add curated boolean-as-MC from misconceptions (backup)
    if len(curated) < TARGET_MC:
        curated = dedupe_mc(curated + generate_synthetic_mc(TARGET_MC))
    return curated[:TARGET_MC]


def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {path.relative_to(ROOT)}")


def topup_mc_from_mirror(current: list[dict]) -> list[dict]:
    existing = {q["question"].lower() for q in current}
    need = TARGET_MC - len(current)
    extra: list[dict] = []
    if need > 0:
        extra.extend(fetch_opentdb_offline(existing, need))
    if len(current) + len(extra) < TARGET_MC:
        extra.extend(generate_synthetic_mc(TARGET_MC))
    merged = dedupe_mc(current + extra)
    return merged[:TARGET_MC]


def main() -> None:
    random.seed(42)
    fast = "--fast" in sys.argv
    print("=== Building content pools ===")

    mc_path = ROOT / "content/trivia/multiple-choice.json"
    if fast and mc_path.exists():
        current = json.loads(mc_path.read_text(encoding="utf-8")).get("questions", [])
        print(f"Fast mode: topping up MC from {len(current)} existing")
        mc = topup_mc_from_mirror(current)
    else:
        mc = build_mc_pool()
    write_json(ROOT / "content/trivia/multiple-choice.json", {"questions": mc})

    bools = dedupe_statements(generate_true_or_lie(TARGET_BOOL))
    write_json(ROOT / "content/trivia/true-or-lie.json", {"statements": bools})

    draw = dedupe_strings(generate_draw_guess(TARGET_DRAW))
    shirts = dedupe_strings(generate_shirt_designs(TARGET_SHIRT))
    write_json(ROOT / "content/drawing/prompts.json", {"drawGuess": draw, "shirtDesigns": shirts})

    wv = {
        "quiplash": dedupe_strings(generate_quiplash(TARGET_QUIPLASH)),
        "fibbage": dedupe_fibbage(generate_fibbage(TARGET_FIBBAGE)),
        "finishSentence": dedupe_strings(generate_finish_sentence(40)),
        "pitch": dedupe_strings(generate_pitch(40)),
        "textTransform": dedupe_strings(generate_text_transform(40)),
        "wordChain": dedupe_strings(generate_word_chain(80), min_len=4),
        "debate": dedupe_strings(generate_debate(80)),
        "rank": dedupe_strings(generate_rank(60)),
        "sort": dedupe_strings(generate_sort(60)),
        "bracket": dedupe_strings(generate_bracket(40)),
        "roleLabel": dedupe_strings(generate_role_label(40)),
        "teamwork": dedupe_strings(generate_teamwork(50)),
        "hiddenTask": dedupe_strings(generate_hidden_task(50)),
    }
    write_json(ROOT / "content/write-vote/prompts.json", wv)

    print("\n=== Final counts ===")
    print(f"  multiple-choice: {len(mc)}")
    print(f"  true-or-lie:     {len(bools)}")
    print(f"  drawGuess:       {len(draw)}")
    print(f"  shirtDesigns:    {len(shirts)}")
    for k, v in wv.items():
        print(f"  {k}: {len(v)}")
    print("Done.")


if __name__ == "__main__":
    main()