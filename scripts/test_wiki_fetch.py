import json
import re
import urllib.parse
import urllib.request
from html import unescape


def fetch_fandom(title):
    params = {
        "action": "parse",
        "page": title,
        "prop": "text",
        "format": "json",
        "formatversion": "2",
        "redirects": "1",
    }
    url = "https://jackboxgames.fandom.com/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "MileHighGames/1.0"})
    data = json.loads(urllib.request.urlopen(req, timeout=30).read())
    parse = data.get("parse", {})
    print(f"fandom {title!r} -> {parse.get('title')} redirects={parse.get('redirects')} len={len(parse.get('text',''))}")


def fetch_jackbox_html(title):
    url = f"https://jackbox.wiki/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"
    req = urllib.request.Request(url, headers={"User-Agent": "MileHighGames/1.0"})
    try:
        html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
        if "Page not found" in html or "does not exist" in html:
            print(f"jackbox {title!r} -> NOT FOUND")
            return
        text = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.I)
        text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.I)
        text = re.sub(r"<[^>]+>", " ", text)
        text = unescape(re.sub(r"\s+", " ", text))
        print(f"jackbox {title!r} -> len={len(text)} snippet={text[200:400]!r}")
    except Exception as e:
        print(f"jackbox {title!r} -> ERR {e}")


for t in ["Fibbage", "Lie Swatter", "Quiplash 3", "Drawful Animate", "Dirty Drawful", "Drawful (series)", "The Jackbox Naughty Pack"]:
    fetch_fandom(t)
    fetch_jackbox_html(t)
    print("---")