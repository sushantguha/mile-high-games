#!/usr/bin/env python3
"""
Jackbox Party Game Picker & Planner

Complete tool based on the games table in info.txt (via data/games.json).

Run:
  python cli/jackbox_picker.py --help
  python cli/jackbox_picker.py --players 6 --family --pick 3
  python cli/jackbox_picker.py --plan 5
  python cli/jackbox_picker.py -i   # interactive mode
"""

import argparse
import json
import random
import re
import sys
from collections import Counter
from pathlib import Path


def find_data_path():
    candidates = [
        Path(__file__).parent.parent / "data" / "games.json",
        Path("data") / "games.json",
        Path("../data/games.json"),
        Path("games.json"),
    ]
    for p in candidates:
        if p.exists():
            return p
    return None


def load_games():
    data_path = find_data_path()
    if not data_path:
        print("ERROR: Could not find data/games.json", file=sys.stderr)
        print("Make sure you are running from the project root or data/ exists.", file=sys.stderr)
        sys.exit(1)
    with open(data_path, "r", encoding="utf-8") as f:
        games = json.load(f)
    for g in games:
        try:
            g["Min. Players"] = int(g.get("Min. Players", 0) or 0)
            g["Max. Players"] = int(g.get("Max. Players", 0) or 0)
        except (ValueError, TypeError):
            g["Min. Players"] = 0
            g["Max. Players"] = 0
    return games, str(data_path)


def parse_minutes(length_str):
    if not length_str:
        return 999
    m = re.search(r"(\d+)", str(length_str))
    return int(m.group(1)) if m else 999


def filter_games(
    games,
    players=None,
    family_only=False,
    max_length=None,
    game_type=None,
    pack=None,
    audience_only=False,
    search=None,
):
    results = []
    for g in games:
        if players is not None:
            if not (g["Min. Players"] <= players <= g["Max. Players"]):
                continue
        if family_only and g.get("Family Friendly?") != "Yes":
            continue
        if max_length is not None and parse_minutes(g.get("Length")) > max_length:
            continue
        type_blob = (g.get("Game Type", "") + " " + g.get("Secondary Type", "")).lower()
        if game_type and game_type.lower() not in type_blob:
            continue
        if pack and pack.lower() not in g.get("Game Pack", "").lower():
            continue
        if audience_only and g.get("Audience") != "Yes":
            continue
        if search and search.lower() not in g.get("Game Title", "").lower():
            continue
        results.append(g)
    return results


def format_game(g):
    fam = "✅ Family" if g.get("Family Friendly?") == "Yes" else "🔞 Mature"
    aud = "📺+Aud" if g.get("Audience") == "Yes" else ""
    types = g.get("Game Type", "")
    if g.get("Secondary Type"):
        types += f" / {g['Secondary Type']}"
    length = g.get("Length", "?")
    return (
        f"{g['Game Title']}  |  {g['Game Pack']}  |  "
        f"{g['Min. Players']}-{g['Max. Players']} players  |  {length}  |  "
        f"{fam} {aud}  |  {types}"
    )


def pick_random(filtered, count=1):
    if not filtered:
        return []
    return random.sample(filtered, min(count, len(filtered)))


def suggest_plan(games, num_games=4, players=None, family_only=False, max_length=25):
    """Suggest a session with good type variety."""
    pool = filter_games(games, players=players, family_only=family_only, max_length=max_length)
    if not pool:
        return []

    buckets = {}
    for g in pool:
        t = g.get("Game Type") or "Other"
        buckets.setdefault(t, []).append(g)

    plan = []
    used = set()
    for t in list(buckets.keys()):
        if len(plan) >= num_games:
            break
        cands = [g for g in buckets[t] if g["Game Title"] not in used]
        if cands:
            choice = random.choice(cands)
            plan.append(choice)
            used.add(choice["Game Title"])

    # Fill the rest
    while len(plan) < num_games and pool:
        rem = [g for g in pool if g["Game Title"] not in used]
        if not rem:
            break
        choice = random.choice(rem)
        plan.append(choice)
        used.add(choice["Game Title"])
    return plan


def interactive_mode(games):
    print("=== Jackbox Party Game Picker - Interactive ===")
    print("Enter commands. Type 'help' for options. 'quit' to exit.\n")
    filters = {}
    while True:
        try:
            raw = input("> ").strip()
            cmd = raw.lower()
        except (EOFError, KeyboardInterrupt):
            print("\nExiting.")
            break

        if cmd in ("quit", "exit", "q"):
            print("See you at the next party!")
            break
        if cmd in ("help", "h", "?"):
            print(
                "players N | family | maxmin N | type Drawing | pack 11 | audience | search quiplash\n"
                "list [N] | pick [N] | plan [N] | reset | stats | quit"
            )
            continue
        if cmd == "reset":
            filters = {}
            print("All filters cleared.")
            continue
        if cmd == "stats":
            pool = filter_games(games, **filters)
            print(f"Current pool size: {len(pool)}")
            if pool:
                print("Top game types:", Counter(g.get("Game Type") for g in pool).most_common(5))
            continue

        parts = cmd.split(maxsplit=1)
        action = parts[0]
        arg = parts[1] if len(parts) > 1 else None

        if action == "players" and arg:
            try:
                filters["players"] = int(arg)
                print(f"Player count filter: {arg}")
            except ValueError:
                print("Please give a number.")
        elif action == "family":
            filters["family_only"] = not filters.get("family_only", False)
            print("Family friendly only:", filters.get("family_only"))
        elif action in ("maxmin", "maxlength") and arg:
            try:
                filters["max_length"] = int(arg)
            except ValueError:
                print("Number please.")
        elif action == "type" and arg:
            filters["game_type"] = arg
        elif action == "pack" and arg:
            filters["pack"] = arg
        elif action == "audience":
            filters["audience_only"] = not filters.get("audience_only", False)
        elif action == "search" and arg:
            filters["search"] = arg
        elif action == "list":
            n = int(arg) if arg and arg.isdigit() else 15
            pool = filter_games(games, **filters)
            for g in pool[:n]:
                print("  " + format_game(g))
            print(f"  ({len(pool)} total matching)")
        elif action == "pick":
            n = int(arg) if arg and arg.isdigit() else 1
            pool = filter_games(games, **filters)
            chosen = pick_random(pool, n)
            print("Random pick(s):")
            for g in chosen:
                print("  >> " + format_game(g))
        elif action == "plan":
            n = int(arg) if arg and arg.isdigit() else 4
            plan = suggest_plan(
                games, num_games=n, **{k: v for k, v in filters.items() if k in ["players", "family_only", "max_length"]}
            )
            print(f"Suggested varied {len(plan)}-game lineup:")
            for i, g in enumerate(plan, 1):
                print(f"  {i}. {format_game(g)}")
        else:
            print("Unknown command. Try 'help', 'list', 'pick 3', or 'plan'.")


def main():
    parser = argparse.ArgumentParser(description="Jackbox Party Game Picker & Session Planner")
    parser.add_argument("--players", type=int, help="Your group size (games must support it)")
    parser.add_argument("--family", action="store_true", help="Only show family-friendly games")
    parser.add_argument("--max-length", type=int, help="Max game length (minutes)")
    parser.add_argument("--type", dest="game_type", help="Game type filter (e.g. Drawing, Trivia)")
    parser.add_argument("--pack", help="Pack filter (partial match, e.g. 11 or Naughty)")
    parser.add_argument("--audience", action="store_true", help="Only games with audience support")
    parser.add_argument("--search", help="Search text in title")
    parser.add_argument("--pick", type=int, nargs="?", const=1, help="Pick N random games")
    parser.add_argument("--plan", type=int, nargs="?", const=4, help="Generate a varied party plan of N games")
    parser.add_argument("--list", action="store_true", help="List all matching games")
    parser.add_argument("-i", "--interactive", action="store_true", help="Launch interactive mode")

    args = parser.parse_args()
    games, dpath = load_games()
    print(f"Loaded {len(games)} Jackbox games from {dpath}")

    flt = {
        "players": args.players,
        "family_only": args.family,
        "max_length": args.max_length,
        "game_type": args.game_type,
        "pack": args.pack,
        "audience_only": args.audience,
        "search": args.search,
    }
    flt = {k: v for k, v in flt.items() if v not in (None, False)}

    if args.interactive or (len(sys.argv) == 1):
        interactive_mode(games)
        return

    pool = filter_games(games, **flt)

    if args.pick:
        chosen = pick_random(pool, args.pick)
        print(f"\nRandom selection from {len(pool)} matches:")
        for g in chosen:
            print("  " + format_game(g))
    elif args.plan is not None:
        plan = suggest_plan(games, num_games=args.plan, players=args.players,
                            family_only=args.family, max_length=args.max_length or 25)
        print(f"\nRecommended {len(plan)}-game party plan (good type variety):")
        for i, g in enumerate(plan, 1):
            print(f"  {i}. {format_game(g)}")
    else:
        print(f"\nMatching games ({len(pool)}):")
        for g in pool:
            print("  " + format_game(g))


if __name__ == "__main__":
    main()

