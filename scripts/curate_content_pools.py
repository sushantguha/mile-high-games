"""Rule-based curation filters — LLM-style quality gate without external API."""

from __future__ import annotations

import re
from typing import Any

JUNK_PATTERNS = [
    re.compile(r"first video game console was the", re.I),
    re.compile(r"the word 'pioneer' can mean", re.I),
    re.compile(r"the human body has enough \w+ for", re.I),
    re.compile(r"\[JUNK\]", re.I),
    re.compile(r"placeholder for", re.I),
    re.compile(r"^test(ing)?\s", re.I),
    re.compile(r"lorem ipsum", re.I),
    re.compile(r"undefined|null", re.I),
]

BANNED_SUBSTRINGS = [
    "jackbox.tv",
    "quiplash.com",
    "fibbage answer key",
]

MIN_QUESTION_LEN = 12
MAX_QUESTION_LEN = 220
MIN_PROMPT_LEN = 8
MAX_PROMPT_LEN = 180


def _has_junk(text: str) -> bool:
    t = text.strip()
    if not t:
        return True
    for pat in JUNK_PATTERNS:
        if pat.search(t):
            return True
    low = t.lower()
    for bad in BANNED_SUBSTRINGS:
        if bad in low:
            return True
    return False


def curate_mc_question(q: dict[str, Any]) -> dict[str, Any] | None:
    question = (q.get("question") or "").strip()
    answer = (q.get("answer") or "").strip()
    distractors = [str(d).strip() for d in (q.get("distractors") or []) if str(d).strip()]
    if _has_junk(question) or _has_junk(answer):
        return None
    if not (MIN_QUESTION_LEN <= len(question) <= MAX_QUESTION_LEN):
        return None
    if not answer or len(answer) > 80:
        return None
    if len(distractors) < 3:
        return None
    # Normalize distractors: no dupes, answer not in distractors
    seen: set[str] = {answer.lower()}
    clean_d: list[str] = []
    for d in distractors:
        if d.lower() in seen:
            continue
        seen.add(d.lower())
        clean_d.append(d)
    if len(clean_d) < 3:
        return None
    return {"question": question, "answer": answer, "distractors": clean_d[:3]}


def curate_statement(s: dict[str, Any]) -> dict[str, Any] | None:
    text = (s.get("text") or "").strip()
    if _has_junk(text):
        return None
    if not (MIN_PROMPT_LEN <= len(text) <= MAX_PROMPT_LEN):
        return None
    if text.endswith("?"):
        return None
    return {"text": text, "isTrue": bool(s.get("isTrue"))}


def curate_string_prompt(text: str, *, min_len: int = MIN_PROMPT_LEN) -> str | None:
    t = text.strip()
    if _has_junk(t):
        return None
    if not (min_len <= len(t) <= MAX_PROMPT_LEN):
        return None
    return t


def curate_fibbage(entry: dict[str, Any]) -> dict[str, str] | None:
    prompt = (entry.get("prompt") or "").strip()
    truth = (entry.get("truth") or "").strip()
    if _has_junk(prompt) or _has_junk(truth):
        return None
    if "_____" not in prompt:
        return None
    if not truth or len(truth) > 80:
        return None
    if not (MIN_PROMPT_LEN <= len(prompt) <= MAX_PROMPT_LEN):
        return None
    return {"prompt": prompt, "truth": truth}


def dedupe_mc(questions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for q in questions:
        curated = curate_mc_question(q)
        if not curated:
            continue
        key = curated["question"].lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(curated)
    return out


def dedupe_statements(statements: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for s in statements:
        curated = curate_statement(s)
        if not curated:
            continue
        key = curated["text"].lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(curated)
    return out


def dedupe_strings(prompts: list[str], *, min_len: int = MIN_PROMPT_LEN) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for p in prompts:
        curated = curate_string_prompt(p, min_len=min_len)
        if not curated:
            continue
        key = curated.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(curated)
    return out


def dedupe_fibbage(entries: list[dict[str, Any]]) -> list[dict[str, str]]:
    seen: set[str] = set()
    out: list[dict[str, str]] = []
    for e in entries:
        curated = curate_fibbage(e)
        if not curated:
            continue
        key = curated["prompt"].lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(curated)
    return out