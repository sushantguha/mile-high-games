#!/usr/bin/env python3
"""Filter Jackbox games to latest versions and generate detailed info files."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_IN = ROOT / "data" / "games.json"
DATA_OUT = ROOT / "data" / "games_filtered.json"
INFO_DIR = ROOT / "games-info"
IMAGES_DIR = INFO_DIR / "images"

# Games to exclude — superseded by a newer version in the same franchise
SUPERSEDED = {
    "Drawful",  # -> Drawful Animate
    "Fibbage XL",
    "Fibbage 2",
    "Fibbage 3",  # -> Fibbage 4
    "Quiplash XL",
    "Quiplash 2",  # -> Quiplash 3
    "Tee K.O. T-Shirt Knock Out",  # -> Tee K.O. 2
    "Trivia Murder Party",  # -> Trivia Murder Party 2
    "You Don't Know Jack 2015",  # -> You Don't Know Jack Full Stream
}

# Duplicate entries from Party Starter (same game as in numbered packs)
PARTY_STARTER_DUPES = {
    "Quiplash 3",
    "Trivia Murder Party 2",
}

GAME_DETAILS = {
    "Lie Swatter": {
        "summary": "Fast-paced trivia where players swat lies and avoid truths.",
        "how_to_play": """Each round presents a statement. Players must quickly decide if it's TRUE or a LIE and swat the correct side.
Points go to players who swat lies correctly. Swatting a truth costs you points.
The player with the most points at the end wins.
Great for large groups — supports up to 100 players.""",
        "host_role": "Displays statements, tracks scores, shows who swatted correctly.",
        "player_role": "Tap LIE or TRUTH as fast as possible on your phone.",
        "rounds": "Several rounds of rapid-fire statements.",
        "scoring": "Correct lie swats earn points; swatting truths loses points.",
        "tips": "Read carefully — trick questions are common. Speed matters on ties.",
    },
    "Word Spud": {
        "summary": "Collaborative word association chain with secret constraints.",
        "how_to_play": """Players take turns adding a word related to the previous word.
Each player secretly receives a constraint (e.g., must include a certain letter, can't use a category).
Others vote on whether the word satisfies the hidden rule.
Fool the group without breaking your constraint.""",
        "host_role": "Shows the word chain, reveals constraints after voting.",
        "player_role": "Submit one word per turn; vote on others' submissions.",
        "rounds": "Multiple chains across the session.",
        "scoring": "Points for fooling players and satisfying your constraint.",
        "tips": "Pick words that seem natural but sneakily meet your secret rule.",
    },
    "Fibbage 4": {
        "summary": "The ultimate bluffing trivia game — write convincing lies for real trivia.",
        "how_to_play": """A bizarre but true fact is shown with a blank. Everyone fills in the missing answer.
All submissions (including the truth) are shuffled and displayed.
Vote for what you think is the REAL answer. Fool others to steal their votes.
Includes Fibbage Fan Favorites and Fibbage Enough About You modes.""",
        "host_role": "Shows the prompt, collects lies, reveals truth and scores.",
        "player_role": "Type a convincing lie, then vote for the real answer.",
        "rounds": "Typically 9 rounds.",
        "scoring": "Points for votes on your lie + points for finding the truth.",
        "tips": "Match the tone of real answers. Obscure facts make the best lies.",
    },
    "Quiplash 3": {
        "summary": "Write funny answers to prompts and vote on the best.",
        "how_to_play": """Each round gives an open-ended prompt (e.g., 'A terrible name for a coffee shop').
Everyone writes a funny response. Responses are paired head-to-head on the host screen.
All players and audience vote on the funnier answer. Winner gets points.
Includes Quiplash Kidding (kid-friendly) and Thriplash (three answers) modes.""",
        "host_role": "Displays prompts, head-to-head matchups, and vote results.",
        "player_role": "Write witty answers and vote between two choices.",
        "rounds": "Two writing rounds plus a final round.",
        "scoring": "Votes earn points; audience votes count too.",
        "tips": "Specific beats generic. Puns and surprise twists win votes.",
    },
    "Drawful Animate": {
        "summary": "Draw silly prompts, guess titles, then animate your favorite drawings.",
        "how_to_play": """Everyone gets a weird drawing prompt. Draw it on your phone.
Others type what they think the drawing is called (fake titles).
Everyone votes on the real title among fakes. Then animate a drawing frame-by-frame.
Points for fooling others and guessing correctly.""",
        "host_role": "Shows drawings, title guesses, vote results, and animations.",
        "player_role": "Draw, submit fake titles, vote, and create short animations.",
        "rounds": "Drawing rounds plus an animation finale.",
        "scoring": "Points for votes on fake titles and correct guesses.",
        "tips": "Simple clear drawings work best on small phone screens.",
    },
    "Trivia Murder Party 2": {
        "summary": "Horror-themed trivia where wrong answers get you 'killed' — last alive wins.",
        "how_to_play": """Answer trivia questions correctly to stay alive. Wrong answers put you in danger.
'Killed' players become ghosts who can still win by haunting survivors.
Mini-games between rounds: death lottery, final death, etc.
The last living (or ghost) player wins.""",
        "host_role": "Shows questions, dramatic deaths, mini-games, and final standings.",
        "player_role": "Answer trivia, participate in death mini-games as alive or ghost.",
        "rounds": "Multiple trivia rounds with escalating danger.",
        "scoring": "Survival-based; ghosts compete for a comeback win.",
        "tips": "Ghosts can still earn a victory — stay engaged after dying.",
    },
    "Tee K.O. 2": {
        "summary": "Draw t-shirt designs, battle in a bracket, and build a winning wardrobe.",
        "how_to_play": """Draw slogans and images for t-shirt prompts on your phone.
Designs are paired in a tournament bracket on the host screen.
Vote on which shirt you'd actually wear. Winners advance until one champion remains.
Collect shirts you voted for into your wardrobe.""",
        "host_role": "Runs the bracket tournament and displays designs.",
        "player_role": "Draw shirt designs and vote in head-to-head matchups.",
        "rounds": "Drawing phase then elimination bracket.",
        "scoring": "Bracket advancement; most wins takes the crown.",
        "tips": "Bold simple designs read better on a phone host screen.",
    },
}


def slugify(title: str) -> str:
    s = title.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def default_details(game: dict) -> dict:
    title = game["Game Title"]
    gtype = game.get("Game Type", "Party")
    secondary = game.get("Secondary Type", "")
    types = f"{gtype}" + (f" / {secondary}" if secondary else "")

    return {
        "summary": f"A {types.lower()} party game from {game['Game Pack']}.",
        "how_to_play": f"""{title} is a Jackbox-style {gtype.lower()} game for {game['Min. Players']}-{game['Max. Players']} players.
Typical session length: {game['Length']}.

GAME FLOW:
1. Join the room on your phone with the room code shown on the host screen.
2. The host phone displays prompts, drawings, votes, and scores for everyone to see.
3. Follow on-screen instructions each round — write, draw, vote, or choose on your device.
4. Earn points by being funny, convincing, correct, or creative depending on the round.
5. Player with the most points at the end wins.

This recreation captures the core {gtype.lower()} mechanics for road-trip play on mobile devices.""",
        "host_role": "The host phone is the 'TV' — it shows room code, game state, prompts, submissions, and winners.",
        "player_role": "Each player uses their own phone to input answers, drawings, and votes privately.",
        "rounds": f"Varies; typical Jackbox session runs about {game['Length']}.",
        "scoring": "Points awarded per round based on votes, correctness, or survival depending on game type.",
        "tips": "Keep the host phone visible to everyone. Make sure all players are on the same WiFi/hotspot.",
    }


def filter_games(games: list) -> list:
    filtered = []
    seen_titles = set()
    for g in games:
        title = g["Game Title"]
        pack = g["Game Pack"]
        if title in SUPERSEDED:
            continue
        if pack == "The Jackbox Party Starter" and title in PARTY_STARTER_DUPES:
            continue
        if title in seen_titles:
            continue
        seen_titles.add(title)
        filtered.append(g)
    return filtered


def write_info_file(game: dict) -> Path:
    title = game["Game Title"]
    slug = slugify(title)
    details = {**default_details(game), **GAME_DETAILS.get(title, {})}

    fam = game.get("Family Friendly?", "No")
    aud = game.get("Audience", "No")

    content = f"""{'=' * 60}
{title.upper()}
{'=' * 60}

Pack:          {game['Game Pack']}
Players:       {game['Min. Players']} - {game['Max. Players']}
Length:        {game['Length']}
Game Type:     {game['Game Type']}{' / ' + game['Secondary Type'] if game.get('Secondary Type') else ''}
Family Safe:   {fam}
Audience Mode: {aud}

IMAGE: images/{slug}.svg

{'─' * 60}
SUMMARY
{'─' * 60}
{details['summary']}

{'─' * 60}
HOW TO PLAY
{'─' * 60}
{details['how_to_play']}

{'─' * 60}
HOST SCREEN (TV PHONE)
{'─' * 60}
{details['host_role']}

{'─' * 60}
PLAYER PHONES
{'─' * 60}
{details['player_role']}

{'─' * 60}
ROUNDS & STRUCTURE
{'─' * 60}
{details['rounds']}

{'─' * 60}
SCORING
{'─' * 60}
{details['scoring']}

{'─' * 60}
TIPS FOR ROAD TRIP PLAY
{'─' * 60}
{details['tips']}

{'─' * 60}
TECHNICAL NOTES (THIS APP)
{'─' * 60}
- Game ID: {slug}
- Implemented in the Mile High Games React app
- Join via room code; one phone hosts the shared screen
- Works on mobile browsers (iOS Safari, Android Chrome)
- Requires all devices on the same local network / hotspot
"""
    path = INFO_DIR / f"{slug}.txt"
    path.write_text(content, encoding="utf-8")
    return path


def write_svg_icon(game: dict) -> Path:
    title = game["Game Title"]
    slug = slugify(title)
    gtype = game.get("Game Type", "Other")
    colors = {
        "Drawing": ("#f59e0b", "#78350f"),
        "Trivia": ("#3b82f6", "#1e3a8a"),
        "Fill-In-The-Blank": ("#a855f7", "#581c87"),
        "Writing": ("#10b981", "#064e3b"),
        "Hidden Identity": ("#ef4444", "#7f1d1d"),
        "Teamwork": ("#06b6d4", "#164e63"),
        "Audio": ("#ec4899", "#831843"),
        "Music": ("#8b5cf6", "#4c1d95"),
        "Roleplay": ("#f97316", "#7c2d12"),
        "Other": ("#6366f1", "#312e81"),
    }
    fg, bg = colors.get(gtype, colors["Other"])
    initial = title[0].upper()
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="24" fill="{bg}"/>
  <text x="64" y="78" text-anchor="middle" font-family="system-ui,sans-serif" font-size="56" font-weight="700" fill="{fg}">{initial}</text>
  <text x="64" y="110" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="{fg}" opacity="0.7">{gtype[:12]}</text>
</svg>'''
    path = IMAGES_DIR / f"{slug}.svg"
    path.write_text(svg, encoding="utf-8")
    return path


def main():
    with open(DATA_IN, encoding="utf-8") as f:
        games = json.load(f)

    filtered = filter_games(games)
    INFO_DIR.mkdir(exist_ok=True)
    IMAGES_DIR.mkdir(exist_ok=True)

    for g in filtered:
        write_info_file(g)
        write_svg_icon(g)

    # Add slug and id fields for the app
    for g in filtered:
        g["id"] = slugify(g["Game Title"])
        g["slug"] = g["id"]

    with open(DATA_OUT, "w", encoding="utf-8") as f:
        json.dump(filtered, f, indent=2, ensure_ascii=False)

    print(f"Filtered {len(games)} -> {len(filtered)} games")
    print(f"Wrote {len(filtered)} info files to {INFO_DIR}")
    print(f"Wrote filtered data to {DATA_OUT}")


if __name__ == "__main__":
    main()