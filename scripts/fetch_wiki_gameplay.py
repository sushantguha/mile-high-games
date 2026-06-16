#!/usr/bin/env python3
"""
Fetch gameplay content from both Jackbox wikis for all enabled games.

URL formats (page title = slug after /wiki/):
  Fandom:     https://jackboxgames.fandom.com/wiki/Lie_Swatter
  Jackbox:    https://jackbox.wiki/wiki/Fibbage

Fandom uses underscores between words. Jackbox.wiki may use the same slug or a
shorter/series name (e.g. Fibbage for Fibbage 4). Slugs are defined per game in
scripts/wiki_slugs.json.
"""
import json
import re
import time
import urllib.parse
import urllib.request
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SLUGS = json.loads((ROOT / "scripts" / "wiki_slugs.json").read_text(encoding="utf-8"))
GAMES = json.loads((ROOT / "shared" / "games.json").read_text(encoding="utf-8"))
DISABLED = {"earwax", "hear-say", "dodo-re-mi"}
RAW_DIR = ROOT / "gameplay fine details" / "wiki_raw"

FANDOM_API = "https://jackboxgames.fandom.com/api.php"
FANDOM_PAGE_BASE = "https://jackboxgames.fandom.com/wiki/"
JACKBOX_PAGE_BASE = "https://jackbox.wiki/wiki/"


def strip_html(html: str) -> str:
    html = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<br\s*/?>", "\n", html, flags=re.IGNORECASE)
    html = re.sub(r"</(p|div|h[1-6]|li|tr)>", "\n", html, flags=re.IGNORECASE)
    html = re.sub(r"<[^>]+>", " ", html)
    text = unescape(html)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    return text.strip()


def fandom_page_url(slug: str) -> str:
    return FANDOM_PAGE_BASE + urllib.parse.quote(slug.replace(" ", "_"), safe="/:'!")


def jackbox_page_url(slug: str) -> str:
    return JACKBOX_PAGE_BASE + urllib.parse.quote(slug.replace(" ", "_"), safe="/:'!()")


def fetch_fandom(slug: str) -> tuple[str | None, str]:
    page_url = fandom_page_url(slug)
    params = {
        "action": "parse",
        "page": slug,
        "prop": "text",
        "format": "json",
        "formatversion": "2",
        "redirects": "1",
    }
    url = FANDOM_API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "MileHighGamesWikiFetcher/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8", errors="replace"))
        html = data.get("parse", {}).get("text", "")
        if not html:
            return None, page_url
        return strip_html(html), page_url
    except Exception as e:
        return f"[FETCH ERROR: {e}]", page_url


def fetch_jackbox(slug: str) -> tuple[str | None, str]:
    page_url = jackbox_page_url(slug)
    req = urllib.request.Request(page_url, headers={"User-Agent": "Mozilla/5.0 (MileHighGamesWikiFetcher/1.0)"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            html = resp.read().decode("utf-8", errors="replace")
        if "mw-content-text" not in html or re.search(r'class="noarticletext"', html):
            return None, page_url
        m = re.search(r'id="mw-content-text"[^>]*>(.*?)<div class="printfooter"', html, re.DOTALL)
        if not m:
            m = re.search(r'id="mw-content-text"[^>]*>(.*)', html, re.DOTALL)
        if not m:
            return None, page_url
        return strip_html(m.group(1)), page_url
    except Exception as e:
        return f"[FETCH ERROR: {e}]", page_url


def jackbox_slugs_for(entry: dict) -> list[str]:
    raw = entry.get("jackbox", entry.get("fandom", ""))
    if isinstance(raw, list):
        return raw
    return [raw] if raw else []


def fetch_jackbox_for_game(entry: dict) -> tuple[str | None, list[str]]:
    parts: list[str] = []
    urls: list[str] = []
    for slug in jackbox_slugs_for(entry):
        text, url = fetch_jackbox(slug)
        urls.append(url)
        if text and not str(text).startswith("[FETCH ERROR"):
            parts.append(f"=== {slug} ({url}) ===\n{text}")
        time.sleep(0.2)
    return ("\n\n".join(parts) if parts else None), urls


def extract_section(text: str, heading: str) -> str:
    pattern = rf"(?:^|\n)\s*{re.escape(heading)}\s*\n(.*?)(?=\n\s*(?:[A-Z][^\n]{{0,40}}\n|\Z))"
    m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    return m.group(1).strip() if m else ""


def game_meta(gid: str) -> dict:
    for g in GAMES:
        if g["id"] == gid:
            return g
    return {}


def main():
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    results = {}
    for gid, entry in SLUGS.items():
        if gid.startswith("_") or gid in DISABLED:
            continue
        print(f"Fetching {gid}...")
        meta = game_meta(gid)
        title = meta.get("Game Title", gid)
        fandom_slug = entry["fandom"]
        fandom_text, fandom_url = fetch_fandom(fandom_slug)
        time.sleep(0.25)
        jackbox_text, jackbox_urls = fetch_jackbox_for_game(entry)

        version_section = ""
        if fandom_text and title and not str(fandom_text).startswith("[FETCH ERROR"):
            version_section = extract_section(fandom_text, title)
            if not version_section:
                for alt in [title.replace("'", "'")]:
                    version_section = extract_section(fandom_text, alt)
                    if version_section:
                        break

        record = {
            "meta": meta,
            "sources": {
                "fandom": fandom_url,
                "jackbox": jackbox_urls,
            },
            "fandom": fandom_text,
            "fandom_version_section": version_section or None,
            "jackbox": jackbox_text,
        }
        results[gid] = record
        (RAW_DIR / f"{gid}.json").write_text(
            json.dumps(record, indent=2, ensure_ascii=False), encoding="utf-8"
        )

    summary = {
        gid: {
            "fandom": len(e["fandom"] or "") if e.get("fandom") else 0,
            "fandom_url": e.get("sources", {}).get("fandom"),
            "jackbox": len(e["jackbox"] or "") if e.get("jackbox") else 0,
            "jackbox_urls": e.get("sources", {}).get("jackbox"),
        }
        for gid, e in results.items()
    }
    (RAW_DIR / "_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"Fetched {len(results)} games into {RAW_DIR}")


if __name__ == "__main__":
    main()