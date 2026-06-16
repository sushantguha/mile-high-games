#!/usr/bin/env python3
"""Generate gameplay fine detail stubs from games-info/ for each game in games.json."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GAMES_JSON = ROOT / "shared" / "games.json"
GAMES_INFO = ROOT / "games-info"
OUT_DIR = ROOT / "gameplay fine details"
DISABLED = {"earwax", "hear-say", "dodo-re-mi"}

TEMPLATE = """# {title} ({pack})

> Gameplay fine details for Mile High Games implementation.
> Sources: jackboxgames.fandom.com, jackbox.wiki, games-info/{id}.txt
> Implementation version: latest in {pack}

## Setup and lobby

**Host (main screen):**
- Room code displayed; players join via `/?code=XXXX` or manual code entry.
- Host is not a player — runs game picker and shared screen.
- Min players: {min_p}; max players: {max_p}.

**Players (phones):**
- Open join link or enter code + name.
- See waiting lobby until host starts.

## Round structure

- Length: {length}
- Game type: {game_type}{secondary}
- Archetype engine: see server registry for `{id}`.

## Turn-by-turn flow

### Phase: prompt
- **Host:** Shows round prompt on TV; reads aloud if applicable.
- **Players:** See "Get ready" with prompt preview.

### Phase: input
- **Host:** Submission counter (N/M players answered).
- **Players:** Submit via archetype UI (text, draw, pick-one, etc.).
- Timer visible on phones and host.

### Phase: reveal / vote (if applicable)
- **Host:** Displays all submissions.
- **Players:** Vote for favorite entry OR look at host for results.

### Phase: results
- **Host:** Scoreboard + round winner highlights.
- **Players:** Personal score + placement message.

## Scoring

- See `server/src/games/gameRules.ts` for `{id}` overrides.
- Default archetype scoring applies unless overridden.

## End of game

- Top players on host screen; full leaderboard.
- Host can return to lobby for another game.

## Wiki research notes

{wiki_notes}

---
*Expand this file with frame-accurate Jackbox wiki details. Lie Swatter reference: example_game_detail.txt*
"""


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    games = json.loads(GAMES_JSON.read_text(encoding="utf-8"))
    created = 0
    skipped = 0
    for g in games:
        gid = g["id"]
        if gid in DISABLED:
            skipped += 1
            continue
        out_path = OUT_DIR / f"{gid}.txt"
        if out_path.name == "lie-swatter.txt" and out_path.exists():
            continue
        info_path = GAMES_INFO / f"{gid}.txt"
        wiki_notes = ""
        if info_path.exists():
            text = info_path.read_text(encoding="utf-8", errors="replace")
            wiki_notes = text[:2000].strip()
        else:
            wiki_notes = "(No games-info file — fetch from jackbox.wiki and fandom wiki.)"
        secondary = f" / {g['Secondary Type']}" if g.get("Secondary Type") else ""
        content = TEMPLATE.format(
            title=g["Game Title"],
            pack=g["Game Pack"],
            id=gid,
            min_p=g["Min. Players"],
            max_p=g["Max. Players"],
            length=g["Length"],
            game_type=g["Game Type"],
            secondary=secondary,
            wiki_notes=wiki_notes,
        )
        out_path.write_text(content, encoding="utf-8")
        created += 1
    print(f"Created/updated {created} files in {OUT_DIR} ({skipped} disabled skipped)")


if __name__ == "__main__":
    main()