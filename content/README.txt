MILE HIGH GAMES — CONTENT FOLDER
=============================

All gameplay text content lives here. The server loads these JSON files
via server/src/games/loadContent.ts.

FOLDER STRUCTURE
----------------
  content/trivia/          multiple-choice.json, true-or-lie.json
  content/drawing/         prompts.json (drawGuess + shirtDesigns)
  content/write-vote/      prompts.json (quiplash, fibbage, misc.)
  content/images/          game icons & art (see games-info/images/ for placeholders)

★ START HERE for sourcing better content:
  content/WHERE_TO_SOURCE.txt   (master guide — read this first)

Each subfolder also has its own WHERE_TO_SOURCE.txt with extra detail.

DISABLED GAMES
--------------
Audio games (Earwax, Hear Say, Dodo Re Mi) are disabled until real sound
files are added under a future content/audio/ folder.
See server/src/games/registry.ts → DISABLED_GAME_IDS

HOW TO ADD CONTENT
------------------
1. Edit the JSON files in the appropriate folder
2. Restart the server (npm run dev)
3. No client rebuild needed for text-only changes

JSON SCHEMAS
------------
Trivia multiple-choice:
  { "questions": [{ "question": "...", "answer": "...", "distractors": ["...", "..."] }] }

Trivia true-or-lie:
  { "statements": [{ "text": "...", "isTrue": true }] }

Drawing:
  { "drawGuess": ["..."], "shirtDesigns": ["..."] }

Fibbage (inside write-vote/prompts.json):
  { "prompt": "The first email said _____.", "truth": "QWERTYUIOP" }