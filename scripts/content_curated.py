"""Curated seeds and combinator generators for party-game content pools."""

from __future__ import annotations

import itertools
import random
from typing import Iterable

# --- TRUE OR LIE: hand-picked tricky statements (no auto-spam tails) ---

MISCONCEPTIONS: list[tuple[str, bool]] = [
    ("Goldfish have a three-second memory.", False),
    ("Lightning never strikes the same place twice.", False),
    ("Humans only use 10% of their brains.", False),
    ("The Great Wall of China is visible from space with the naked eye.", False),
    ("Bats are blind.", False),
    ("Chameleons change color primarily to match their background.", False),
    ("Napoleon Bonaparte was unusually short for his era.", False),
    ("Albert Einstein failed mathematics in school.", False),
    ("Vikings wore horned helmets in battle.", False),
    ("Shaving makes hair grow back thicker and darker.", False),
    ("Cracking your knuckles causes arthritis.", False),
    ("Sugar makes children hyperactive.", False),
    ("Humans swallow eight spiders per year while sleeping.", False),
    ("The forbidden fruit in the Bible was an apple.", False),
    ("Christopher Columbus proved the Earth was round.", False),
    ("Medieval scholars widely believed the Earth was flat.", False),
    ("George Washington had wooden teeth.", False),
    ("Thomas Edison invented the light bulb from scratch.", False),
    ("Marie Antoinette said 'Let them eat cake.'", False),
    ("Blood in veins is blue before it is oxygenated.", False),
    ("Humans have exactly five senses.", False),
    ("Your tongue has fixed taste zones for sweet, salty, sour, and bitter.", False),
    ("Dogs age seven years for every human year at all life stages.", False),
    ("Bulls hate the color red.", False),
    ("Ostriches bury their heads in sand when scared.", False),
    ("Lemmings commit mass suicide by jumping off cliffs.", False),
    ("Humans and dinosaurs lived at the same time.", False),
    ("The Sahara is the world's largest desert.", False),
    ("Seasons are caused by Earth's distance from the Sun.", False),
    ("The Moon has a dark side that never receives sunlight.", False),
    ("A penny dropped from the Empire State Building can kill someone.", False),
    ("Hair and nails keep growing after death.", False),
    ("You lose most body heat through your head.", False),
    ("Microwave radiation makes food radioactive.", False),
    ("Vaccines cause autism.", False),
    ("Antibiotics work against viral infections like the common cold.", False),
    ("Swallowed gum stays in your stomach for seven years.", False),
    ("Fortune cookies originated in China.", False),
    ("Humans evolved from modern chimpanzees.", False),
    ("Black holes are cosmic vacuum cleaners that suck in everything nearby.", False),
    ("Astronauts are weightless in orbit because they are far from Earth's gravity.", False),
    ("Glass is a very slow-moving liquid at room temperature.", False),
    ("Diamonds are formed from compressed coal.", False),
    ("Cold weather causes the common cold.", False),
    ("Humans have the same number of neck vertebrae as giraffes.", True),
    ("Venus is the hottest planet in our solar system.", True),
    ("Octopuses have three hearts.", True),
    ("Cleopatra lived closer in time to the Moon landing than to the Great Pyramid.", True),
    ("Oxford University is older than the Aztec Empire.", True),
    ("Mammoths were still alive when the Great Pyramid was built.", True),
    ("Honey never spoils under normal sealed storage.", True),
    ("Bananas are berries but strawberries are not.", True),
    ("Humans share roughly 50% of their DNA with bananas.", True),
    ("Sharks are older than trees.", True),
    ("A day on Venus is longer than a year on Venus.", True),
    ("Wombat poop is cube-shaped.", True),
    ("Scotland's national animal is the unicorn.", True),
    ("A shrimp's heart is located in its head.", True),
    ("Russia has a larger surface area than Pluto.", True),
    ("Cows have best friends and get stressed when separated.", True),
    ("The average cloud weighs about 1.1 million pounds.", True),
    ("A single strand of spaghetti is called a spaghetto.", True),
    ("The first computer mouse was made of wood.", True),
    ("The first email ever sent said QWERTYUIOP.", True),
    ("The first item sold on eBay was a broken laser pointer.", True),
    ("The first computer bug was an actual moth.", True),
    ("Ada Lovelace is considered the first computer programmer.", True),
    ("A group of flamingos is called a flamboyance.", True),
    ("A group of owls is called a parliament.", True),
    ("A group of porcupines is called a prickle.", True),
    ("The Anglo-Zanzibar War lasted under 45 minutes.", True),
    ("The Great Emu War was a real Australian military operation.", True),
    ("Pong was not the first video game ever created.", True),
    ("The Magnavox Odyssey was an early home video game console.", True),
    ("Peaches and nectarines are the same species.", True),
    ("Tomatoes are botanically fruits.", True),
    ("Peanuts are legumes, not true nuts.", True),
    ("Carrots were originally purple or white, not orange.", True),
    ("Maine is the closest U.S. state to Africa.", True),
    ("Reno, Nevada is farther west than Los Angeles.", True),
    ("Iceland has no mosquitoes.", True),
    ("Koalas have fingerprints nearly indistinguishable from humans.", True),
    ("Male seahorses carry the pregnancy.", True),
    ("Ketchup was once sold as medicine.", True),
    ("The Hawaiian pizza was invented in Canada.", True),
    ("German chocolate cake is named after a person, not the country Germany.", True),
    ("The Caesar salad was invented in Mexico.", True),
    ("Buffalo wings are named after Buffalo, New York.", True),
    ("Champagne can only be called Champagne if from that French region.", True),
    ("White chocolate contains no cocoa solids.", True),
    ("Humans are the only animals that blush.", True),
    ("Identical twins have different fingerprints.", True),
    ("The human liver can regenerate much of itself after damage.", True),
    ("The human body has about 60,000 miles of blood vessels.", True),
    ("A blue whale's heart is roughly the size of a small car.", True),
    ("Tardigrades can survive the vacuum of space temporarily.", True),
    ("Sea otters hold hands while sleeping to avoid drifting apart.", True),
    ("Lobsters were once considered poor people's food.", True),
    ("The sandwich is named after the Earl of Sandwich.", True),
    ("The word nerd first appeared in a Dr. Seuss book.", True),
    ("The QWERTY layout was designed partly to slow typists down.", True),
    ("French was the official language of England for about 300 years after 1066.", True),
    ("The War of Jenkins' Ear was a real historical conflict.", True),
    ("There was once a war between Honduras and El Salvador partly sparked by a soccer match.", True),
    ("The Eiffel Tower can grow about 15 cm taller in summer heat.", True),
    ("Oxford English Dictionary editors once included a fake word as a copyright trap.", True),
    ("The word 'set' has more dictionary definitions than any other English word.", True),
    ("The human body contains enough iron to make a small nail.", True),
    ("The human body sheds about 1.5 pounds of skin per year.", True),
    ("The human body produces about a liter of saliva per day.", True),
    ("The human body has 27 bones in each hand.", True),
    ("The human body has a unique tongue print.", True),
    ("The human body has unique ear shapes usable in biometrics.", True),
    ("The human body has unique iris patterns.", True),
    ("The human body has unique DNA except identical twins.", True),
    ("A person can be born with heterochromia (two different eye colors).", True),
    ("A person can survive with only one kidney.", True),
    ("A person can survive with only one lung.", True),
    ("Blood type is inherited, not chosen.", True),
    ("Lactose tolerance in adults is a genetic adaptation in some populations.", True),
    ("Coffee is the world's second-most traded commodity by some common claims.", False),
    ("Canada has more lakes than the rest of the world combined.", False),
    ("The Bloody Mary cocktail is definitively named after Queen Mary I.", False),
    ("Polaris is the brightest star in the night sky.", False),
    ("The Milky Way is the only galaxy in the universe.", False),
    ("Mount Everest is the tallest mountain from base to peak.", False),
    ("Water drains clockwise in the Northern Hemisphere due to Coriolis.", False),
    ("Organic food is always more nutritious than conventional food.", False),
    ("MSG is inherently harmful to most people.", False),
    ("The five-second rule is backed by peer-reviewed food safety research.", False),
    ("Sound travels in the vacuum of space if loud enough.", False),
    ("The Northern Lights are caused by sunlight reflecting off ice crystals.", False),
    ("Helium changes your voice only because it is lighter than air.", False),
    ("Reading in dim light permanently damages your eyes.", False),
    ("Sitting too close to a TV permanently ruins your vision.", False),
    ("Carrots give you night vision.", False),
    ("Twinkies have no expiration date and last forever.", False),
    ("Police must wait 48 hours before investigating missing adults.", False),
    ("You must wait 24 hours before filing a missing person report.", False),
    ("Touching a baby bird makes its mother abandon it.", False),
    ("Wait an hour after eating before swimming or you will cramp and drown.", False),
    ("Detox diets remove toxins science cannot otherwise detect.", False),
    ("Humans need eight glasses of water per day regardless of context.", False),
    ("We only use one hemisphere of the brain at a time.", False),
    ("Dropping food on the floor is safe if picked up within five seconds.", False),
    ("SOS originally meant 'save our ship.'", False),
    ("Nero fiddled while Rome burned.", False),
    ("Eating turkey alone causes Thanksgiving sleepiness.", False),
    ("Evolution is unproven because it is called a theory.", False),
    ("The Big Bang was an explosion in existing space.", False),
    ("The Sun is yellow when viewed from space.", False),
    ("Meteors are hot because of friction with air alone.", False),
    ("Water is always a poor conductor of electricity.", False),
    ("Feed a cold, starve a fever is medically sound advice.", False),
]

# --- FIBBAGE TRUTHS (weird real facts) ---

FIBBAGE_FACTS: list[tuple[str, str]] = [
    ("The world's largest sauna is located in Finland.", "sauna"),
    ("In ancient Rome, soldiers were sometimes paid in _____.", "salt"),
    ("A group of owls is called a _____.", "parliament"),
    ("The first email ever sent said _____.", "QWERTYUIOP"),
    ("Dolphins sleep with one _____ open.", "eye"),
    ("The shortest war in history lasted _____ minutes.", "38"),
    ("Honey never _____.", "spoils"),
    ("Scotland's national animal is the _____.", "unicorn"),
    ("A shrimp's heart is in its _____.", "head"),
    ("Wombat droppings are _____.", "cube-shaped"),
    ("The inventor of the Pringles can was buried in _____.", "one"),
    ("Oxford University is older than the _____ Empire.", "Aztec"),
    ("Cleopatra lived closer to the Moon landing than the Great _____.", "Pyramid"),
    ("Bananas are berries but strawberries are _____.", "not"),
    ("Humans share about 50% of DNA with _____.", "bananas"),
    ("The Anglo-Zanzibar War lasted under _____ minutes.", "45"),
    ("The Great Emu War was fought in _____.", "Australia"),
    ("Male seahorses carry the _____.", "pregnancy"),
    ("Ketchup was once sold as _____.", "medicine"),
    ("The Caesar salad was invented in _____.", "Mexico"),
    ("German chocolate cake is named after Sam _____.", "German"),
    ("White chocolate has no cocoa _____.", "solids"),
    ("Identical twins have different _____.", "fingerprints"),
    ("A blue whale's heart is about the size of a small _____.", "car"),
    ("Tardigrades can survive the vacuum of _____.", "space"),
    ("Sea otters hold hands so they don't _____.", "drift"),
    ("The sandwich is named after the Earl of _____.", "Sandwich"),
    ("The word nerd first appeared in a Dr. _____ book.", "Seuss"),
    ("French was England's official language for about 300 _____.", "years"),
    ("The Eiffel Tower grows taller in summer _____.", "heat"),
    ("The human body has about 60,000 miles of blood _____.", "vessels"),
    ("The human liver can _____ itself after damage.", "regenerate"),
    ("Koala fingerprints look almost like _____ fingerprints.", "human"),
    ("Peanuts are _____, not true nuts.", "legumes"),
    ("Tomatoes are botanically _____.", "fruits"),
    ("Carrots were originally purple or _____.", "white"),
    ("Maine is the closest U.S. state to _____.", "Africa"),
    ("Iceland has no _____.", "mosquitoes"),
    ("Venus is the hottest _____ in our solar system.", "planet"),
    ("Octopuses have _____ hearts.", "three"),
    ("Sharks are older than _____.", "trees"),
    ("A day on Venus is longer than a year on _____.", "Venus"),
    ("Russia is larger than _____.", "Pluto"),
    ("Cows have best _____ and get stressed apart.", "friends"),
    ("The average cloud weighs over a million _____.", "pounds"),
    ("A strand of spaghetti is a _____.", "spaghetto"),
    ("The first computer mouse was made of _____.", "wood"),
    ("The first eBay sale was a broken laser _____.", "pointer"),
    ("The first computer bug was a real _____.", "moth"),
    ("Ada Lovelace was the first computer _____.", "programmer"),
    ("Flamingos in a group are called a _____.", "flamboyance"),
    ("Porcupines in a group are called a _____.", "prickle"),
    ("The War of Jenkins' Ear was a real _____.", "war"),
    ("Buffalo wings are named after Buffalo, New _____.", "York"),
    ("Champagne must come from the Champagne _____ of France.", "region"),
    ("Humans are the only animals that _____.", "blush"),
    ("Lactose tolerance is a genetic _____ in some adults.", "adaptation"),
    ("The QWERTY keyboard was designed to slow _____ down.", "typists"),
    ("Oxford editors once planted a fake _____ as a trap.", "word"),
    ("The word 'set' has the most dictionary _____.", "definitions"),
    ("The human body sheds about 1.5 pounds of _____ per year.", "skin"),
    ("The human body makes about a liter of _____ per day.", "saliva"),
    ("Your tongue print is _____.", "unique"),
    ("Your iris pattern is _____.", "unique"),
    ("You can survive with only one _____.", "kidney"),
    ("Blood type is _____, not chosen.", "inherited"),
    ("Helium voice happens because sound travels faster in thinner _____.", "air"),
    ("Goldfish memory lasts far longer than three _____.", "seconds"),
    ("Bats are not _____.", "blind"),
    ("Chameleons change color for mood and temperature, not just _____.", "camouflage"),
    ("Napoleon was average height for his _____.", "era"),
    ("Einstein did well in math as a _____.", "student"),
    ("Viking battle helmets did not have _____.", "horns"),
    ("Vein blood only looks blue through skin and _____.", "tissue"),
    ("Humans have more than five _____ senses.", "sensory"),
    ("Dinosaurs went extinct long before _____ existed.", "humans"),
    ("Antarctica is technically a desert by _____ definition.", "precipitation"),
    ("Seasons come from Earth's tilt, not its distance from the _____.", "Sun"),
    ("The far side of the Moon still gets _____.", "sunlight"),
    ("Gum passes through digestion like other _____.", "food"),
    ("Fortune cookies were popularized in _____, not China.", "America"),
    ("Humans and chimps share a common ancestor, not a direct _____ line.", "chimp"),
    ("Astronauts in orbit are still in Earth's gravity; they are in free _____.", "fall"),
    ("Glass is an amorphous solid, not a slow-flowing _____.", "liquid"),
    ("Diamonds form under pressure, not from compressed _____.", "coal"),
    ("Colds are caused by viruses, not cold _____.", "weather"),
    ("Polaris is not the brightest star; Sirius is _____.", "brighter"),
    ("The universe has no single center like a bomb _____.", "site"),
    ("Mauna Kea is taller than Everest when measured from the ocean _____.", "floor"),
    ("Toilet swirl direction is about plumbing, not the Coriolis _____.", "effect"),
    ("Organic does not automatically mean more _____.", "nutritious"),
    ("Most people tolerate MSG just _____.", "fine"),
    ("The five-second rule is a joke, not a safety _____.", "standard"),
    ("Space is a near vacuum; sound needs a _____.", "medium"),
    ("Auroras come from solar particles, not reflected _____.", "sunlight"),
    ("Dim light may strain eyes but does not permanently ruin _____.", "vision"),
    ("Carrots help vision myths but do not grant night _____.", "vision"),
    ("Twinkies do have shelf-life limits despite the _____.", "myth"),
    ("You can report a missing person without waiting 24 _____.", "hours"),
    ("Bird parents rarely abandon chicks because of human _____.", "touch"),
    ("Swimming cramps are not guaranteed one hour after _____.", "eating"),
    ("Detox diets do not remove mystery toxins better than your _____.", "liver"),
    ("Hydration needs vary; eight glasses is not universal _____.", "science"),
    ("Both brain hemispheres work together most of the _____.", "time"),
    ("SOS is a Morse distress pattern, not an acronym for save our _____.", "ship"),
    ("Nero was miles away and did not fiddle during the _____.", "fire"),
    ("Thanksgiving sleepiness is mostly portion size and carbs, not just _____.", "turkey"),
    ("Scientific theory means well-tested explanation, not wild _____.", "guess"),
    ("The Big Bang describes expanding space, not an explosion in existing _____.", "space"),
    ("The Sun looks white from space; it only looks yellow through Earth's _____.", "atmosphere"),
    ("Meteors glow mainly from ram pressure heating, not friction _____.", "alone"),
    ("Pure water is a poor conductor; dissolved ions make it _____.", "conductive"),
    ("Feed a cold, starve a fever is folk advice, not medical _____.", "doctrine"),
]

# --- COMBINATOR WORD LISTS ---

QUIPLASH_TEMPLATES = [
    "A terrible name for a {noun}",
    "The worst thing to yell during {event}",
    "A rejected name for {place}",
    "The title of a movie about {topic}",
    "A bad pickup line involving {noun}",
    "The worst superpower involving {noun}",
    "Something you should never bring to {event}",
    "A terrible slogan for {place}",
    "The name of a band that only plays {noun}",
    "A rejected Olympic event involving {noun}",
    "What {animal} secretly thinks about humans",
    "A horrible name for a {food} restaurant",
    "The worst thing to tattoo on your {body_part}",
    "A new dating app for people who love {noun}",
    "A rejected flavor of {food}",
    "The worst advice for surviving {situation}",
    "A terrible name for a {job} support group",
    "If {celebrity} ran for president, their slogan would be",
    "A cursed theme for a birthday party",
    "The worst thing to say during a job interview for {job}",
    "A rejected mascot for {place}",
    "The name of an extreme sport involving {noun}",
    "A terrible name for a {animal} dating show",
    "What aliens think we do with {noun}",
    "A haunted version of {place}",
    "The worst wedding vow addition",
    "A bad name for a crypto coin themed around {noun}",
    "The least sexy perfume scent: {adjective} {noun}",
    "A rejected kids' show about {animal}",
    "The worst thing to whisper in an elevator",
    "A terrible name for a group chat about {topic}",
    "If {food} had a villain origin story, it would be called",
    "A rejected Hallmark movie title about {topic}",
    "The worst thing to name your {animal}",
    "A new extreme diet that only includes {food}",
    "The worst motivational poster about {topic}",
    "A rejected theme park ride based on {noun}",
    "The worst thing to put on a resume for {job}",
    "A terrible name for a podcast about {topic}",
    "If {place} had a fight song, the chorus would be",
]

DEBATE_TOPICS = [
    "Debate: Is a hot dog a sandwich?",
    "Debate: Does pineapple belong on pizza?",
    "Debate: Is cereal a soup?",
    "Debate: Is water wet?",
    "Debate: Should toilet paper hang over or under?",
    "Debate: Is a taco a sandwich?",
    "Debate: Is cheesecake actually cake?",
    "Debate: Are boneless wings just chicken nuggets?",
    "Debate: Is Die Hard a Christmas movie?",
    "Debate: Is a burger a sandwich?",
    "Debate: Should you put milk or cereal in the bowl first?",
    "Debate: Is a burrito a wrap or a tube sandwich?",
    "Debate: Is listening to an audiobook 'reading'?",
    "Debate: Is a kiwi a berry?",
    "Debate: Is a straw one hole or two holes?",
    "Debate: Would you rather fight one horse-sized duck or 100 duck-sized horses?",
    "Debate: Is it okay to recline your seat on a plane?",
    "Debate: Is clapping when the plane lands cringe?",
    "Debate: Is texting 'k' rude?",
    "Debate: Is it worse to be late or to leave early?",
    "Debate: Should adults sleep with stuffed animals?",
    "Debate: Is it acceptable to wear sunglasses indoors?",
    "Debate: Is a hot dog a taco if you fold the bun?",
    "Debate: Is brunch just late breakfast for people with money?",
    "Debate: Is a Pop-Tart a ravioli?",
    "Debate: Is almond milk really milk?",
    "Debate: Is a calzone a folded pizza or a pizza sandwich?",
    "Debate: Is it okay to dip fries in a milkshake?",
    "Debate: Is it worse to ghost or to leave on read?",
    "Debate: Should the toilet seat stay up or down?",
    "Debate: Is it fine to wear pajama pants in public?",
    "Debate: Is a garage a room?",
    "Debate: Is a balcony a room with no roof?",
    "Debate: Is a hot pocket a sandwich pocket?",
    "Debate: Is cereal better at night than in the morning?",
    "Debate: Is it okay to eat pizza with a fork?",
    "Debate: Is a quesadilla a grilled cheese?",
    "Debate: Is a smoothie a cold soup?",
    "Debate: Is a muffin a cake you eat for breakfast?",
    "Debate: Is a bagel a donut with commitment issues?",
]

DRAW_TEMPLATES = [
    "A {adjective} {animal} {verb} at the {place}",
    "A {animal} wearing {clothing} on a {vehicle}",
    "A {adjective} {object} having an existential crisis",
    "A {animal} as a {job} during {event}",
    "A {object} and a {animal} sharing {food}",
    "A {adjective} wizard at the {place}",
    "A {animal} stuck in a {object}",
    "A robot obsessed with {food}",
    "A {animal} giving a TED talk about {topic}",
    "A haunted {object} at {place}",
    "A {adjective} {animal} riding a {vehicle}",
    "A {object} with human legs running from {animal}",
    "A {animal} DJ at a {event}",
    "A {adjective} cactus {verb} on stage",
    "A shark in {clothing} at {place}",
    "A {animal} eating {food} on a roller coaster",
    "A {object} proposing to a {animal}",
    "A {adjective} toaster at therapy",
    "A {animal} painting a portrait of a {object}",
    "A dragon allergic to {food}",
]

SHIRT_TEMPLATES = [
    'Design a shirt: "{slogan}"',
    'Design a shirt: "Powered by {food}"',
    'Design a shirt: "Professional {job}"',
    'Design a shirt: "I survived {event}"',
    'Design a shirt: "{adjective} and {adjective}"',
    'Design a shirt: "Ask me about my {noun}"',
    'Design a shirt: "World\'s okayest {job}"',
    'Design a shirt: "{animal} mom/dad energy"',
    'Design a shirt: "Emotionally supported by {food}"',
    'Design a shirt: "Warning: may talk about {topic}"',
]

SHIRT_SLOGANS = [
    "I woke up like this (disappointed)",
    "Professional Overthinker",
    "Error 404: Motivation not found",
    "Powered by spite",
    "Talk to the hand (mine's busy)",
    "I'm not lazy, I'm energy efficient",
    "Hold my beer, watch this",
    "Zero days without sarcasm",
    "My therapist knows about you",
    "Chaos coordinator",
    "Emotionally unavailable since birth",
    "I peaked in the group chat",
    "Sorry I'm late, I didn't want to come",
    "I'm here for the snacks",
    "Certified disaster human",
    "Low battery, please charge",
    "Out of office permanently",
    "Do not perceive me",
    "Main character (unpaid)",
    "Gaslight, gatekeep, girlboss",
    "Hot mess express",
    "Feral but make it fashion",
    "No thoughts, head empty",
    "Sus and unbothered",
    "Touch grass (I refuse)",
]

NOUNS = [
    "coffee shop", "yoga studio", "escape room", "pet store", "laundromat",
    "nightclub", "dentist office", "wedding", "funeral", "job interview",
    "group chat", "crypto bro", "dating app", "theme park", "airport",
    "college dorm", "family reunion", "karaoke bar", "DMV", "hospital",
    "spaceship", "submarine", "haunted house", "food truck", "gym",
    "podcast", "reality show", "startup", "conspiracy theory", "influencer",
    "sports team", "tattoo parlor", "thrift store", "arcade", "campground",
]

EVENTS = [
    "a wedding toast", "a funeral", "a job interview", "a first date",
    "a courtroom", "a parent-teacher conference", "a passport control line",
    "a yoga class", "a silent auction", "a gender reveal", "a breakup",
    "a Zoom call", "a dentist appointment", "a marathon", "a protest",
]

PLACES = [
    "a haunted theme park", "a vegan butcher shop", "a prison gift shop",
    "a underwater casino", "a moon colony", "a medieval IKEA",
    "a wizard DMV", "a dinosaur daycare", "a cloud city", "a volcano spa",
]

TOPICS = [
    "taxes", "roommates", "exes", "group trips", "hangovers", "LinkedIn",
    "crypto", "dating apps", "in-laws", "Wi-Fi passwords", "laundry",
    "gym culture", "airport security", "student loans", "petty revenge",
]

ANIMALS = [
    "cat", "dog", "penguin", "llama", "octopus", "raccoon", "goose",
    "capybara", "sloth", "owl", "frog", "bear", "shark", "lobster",
]

FOODS = [
    "pizza", "tacos", "sushi", "nachos", "cereal", "hot dogs", "ramen",
    "waffles", "pickles", "ice cream", "burritos", "fries", "donuts",
]

ADJECTIVES = [
    "angry", "sleepy", "chaotic", "fancy", "cursed", "sentient", "dramatic",
    "passive-aggressive", "unhinged", "melancholy", "feral", "suspicious",
]

VERBS = [
    "breakdancing", "filibustering", "proposing", "panicking", "vibing",
    "negotiating", "sobbing", "flexing", "meditating", "scheming",
]

OBJECTS = [
    "toaster", "lawnmower", "traffic cone", "vending machine", "lamp",
    "microwave", "shopping cart", "fire hydrant", "parking meter", "cactus",
]

CLOTHING = [
    "a tutu", "a tuxedo", "a cowboy hat", "a cape", "a snorkel",
    "a business suit", "a onesie", "a crown", "a helmet", "a scarf",
]

VEHICLES = [
    "skateboard", "unicycle", "shopping cart", "roller coaster", "submarine",
    "hot air balloon", "golf cart", "rocket", "canoe", "segway",
]

JOBS = [
    "librarian", "clown", "astronaut", "barista", "lifeguard", "witch",
    "influencer", "tax auditor", "pirate", "therapist", "DJ", "chef",
]

BODY_PARTS = [
    "forehead", "lower back", "ankle", "neck", "knuckles", "elbow",
]

CELEBRITIES = [
    "a billionaire", "a pop star", "a retired athlete", "a tech CEO",
    "a reality TV villain", "a cult leader", "a motivational speaker",
]

SITUATIONS = [
    "a zombie apocalypse", "a group trip", "a family dinner", "a breakup",
    "a job interview", "a haunted Airbnb", "a long flight", "a power outage",
]

RANK_SETS = [
    ("Pizza toppings", ["Pineapple", "Pepperoni", "Mushroom", "Anchovy", "Olives"]),
    ("Morning routines", ["Snooze alarm", "Coffee first", "Exercise", "Skip breakfast", "Scroll phone"]),
    ("Pet choices", ["Dog", "Cat", "Hamster", "Goldfish", "Snake"]),
    ("Hangover cures", ["Water", "Greasy food", "More drinks", "Sleep", "Regret"]),
    ("Date ideas", ["Movies", "Hiking", "Cooking together", "Arcade", "Museum"]),
    ("Vacation spots", ["Beach", "Mountains", "City break", "Camping", "Staycation"]),
    ("Social apps", ["Group chat", "Stories", "Dating app", "LinkedIn", "Anonymous forum"]),
    ("Party snacks", ["Chips", "Wings", "Veggie tray", "Candy", "Cheese board"]),
    ("Superpowers", ["Flight", "Invisibility", "Time travel", "Mind reading", "Super strength"]),
    ("Movie genres", ["Comedy", "Horror", "Rom-com", "Documentary", "Action"]),
]

SORT_SETS = [
    ("historical events", ["Moon landing", "World War II ends", "First iPhone", "Internet goes public", "Fall of Berlin Wall"]),
    ("animals by size", ["Mouse", "Human", "Horse", "Elephant", "Blue whale"]),
    ("buildings by height", ["Statue of Liberty", "Eiffel Tower", "Empire State Building", "Burj Khalifa", "Great Pyramid"]),
    ("planets from Sun", ["Mercury", "Venus", "Earth", "Mars", "Jupiter"]),
    ("decades", ["1970s", "1980s", "1990s", "2000s", "2010s"]),
    ("fast food founding", ["McDonald's", "KFC", "Subway", "Chipotle", "Five Guys"]),
    ("inventions", ["Telephone", "Television", "Personal computer", "World Wide Web", "Smartphone"]),
    ("oceans by size", ["Arctic", "Indian", "Atlantic", "Southern", "Pacific"]),
]

BRACKET_TOPICS = [
    "Best pizza topping", "Best superpower", "Best vacation spot", "Best movie genre",
    "Best season", "Best hangover food", "Best house pet", "Best party game",
    "Best social media platform", "Best breakfast food", "Best road trip snack",
    "Best fictional villain", "Best emoji", "Best ice cream flavor", "Best sport to watch",
    "Best decade for music", "Best city to visit", "Best comfort show", "Best meme format",
    "Best coffee order", "Best Halloween costume idea", "Best gift to regift",
    "Best airport activity", "Best group chat name theme", "Best date red flag",
]

ROLE_LABELS = [
    "Who is most likely to survive a zombie apocalypse?",
    "Who gives the best advice?",
    "Who would win in a dance-off?",
    "Who is the best cook?",
    "Who would accidentally start a cult?",
    "Who is most likely to become famous?",
    "Who would die first in a horror movie?",
    "Who sends the riskiest texts?",
    "Who is the biggest chaos agent?",
    "Who would win at poker?",
    "Who is most likely to move abroad on a whim?",
    "Who has the worst taste in partners?",
    "Who would eat something expired 'to test it'?",
    "Who is most likely to get banned from a bar?",
    "Who would become a billionaire or go broke first?",
    "Who is the best at keeping secrets?",
    "Who would spoil a TV show on purpose?",
    "Who is most likely to cry at a commercial?",
    "Who would survive longest on a deserted island?",
    "Who is the worst at directions?",
]

TEAMWORK_PROMPTS = [
    "Everyone pick a different wire color — exactly one is safe!",
    "Each player must choose a unique number from 1 to 8.",
    "Coordinate: one player says HEADS, another says TAILS.",
    "Pick tools in order without repeating: wrench, hammer, screwdriver, drill.",
    "Assign each player a unique planet: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus.",
    "One player must type YES while another types NO at the same time.",
    "Each player picks a unique emoji reaction; no duplicates allowed.",
    "Split the code: Player 1 enters 4, Player 2 enters 2, Player 3 enters 8.",
    "Everyone choose a different card suit: hearts, diamonds, clubs, spades.",
    "Pick unique colors: red, blue, green, yellow, purple, orange, pink.",
    "One player says START, another says STOP, another says GO.",
    "Each player selects a unique day of the week.",
    "Assign roles: captain, engineer, medic, pilot — no repeats.",
    "Everyone type a different vowel: A, E, I, O, U.",
    "Pick unique seasons: spring, summer, fall, winter.",
]

HIDDEN_TASKS = [
    "Raise your hand when the host says the secret word.",
    "Nod when someone mentions food.",
    "Type a message containing the word BLUE.",
    "Vote for the player on your left in the next round.",
    "Laugh when anyone says 'definitely'.",
    "Say 'interesting' in your next submission.",
    "Vote for the player with the longest name.",
    "Submit an answer that rhymes with 'cat'.",
    "Type the word 'banana' without anyone noticing.",
    "Vote for whoever submitted first.",
    "Include a number in your answer.",
    "Mention the weather in your submission.",
    "Vote for the host's favorite answer (guess it).",
    "Use all caps in one word of your answer.",
    "Submit the shortest possible answer.",
    "Submit the longest possible answer.",
    "Vote for an answer that contains the letter Z.",
    "Type 'trust me' in your submission.",
    "Vote for the middle entry on the list.",
    "Include an animal in your answer.",
]

FINISH_SENTENCES = [
    "The best part of waking up is _____",
    "I never leave home without _____",
    "My doctor told me to stop _____",
    "In the future, everyone will _____",
    "The worst part about dating is _____",
    "My group chat is mostly _____",
    "I knew it was a bad idea when _____",
    "My toxic trait is _____",
    "The airport security agent found _____",
    "I regret googling _____",
    "My bank account cries whenever I _____",
    "The wedding toast went wrong when _____",
    "I peaked when _____",
    "My Roman Empire is _____",
    "I would sell my soul for _____",
    "My Uber driver asked me about _____",
    "The group chat exploded when someone sent _____",
    "I knew adulthood hit when I got excited about _____",
    "My most controversial opinion is about _____",
    "The worst thing I ever googled at 3am was _____",
    "My situationship ended because of _____",
    "I can't go to family dinner without discussing _____",
    "My toxic coping mechanism is _____",
    "The red flag I ignored was _____",
    "My villain origin story started with _____",
    "I would fight a bear for _____",
    "My last brain cell is dedicated to _____",
    "The hill I will die on involves _____",
    "My most unhinged purchase was _____",
    "I pretend to like _____ to fit in",
    "My honest LinkedIn headline would mention _____",
    "The worst text I ever sent said _____",
    "My Roman Empire is actually _____",
    "I would delete my search history before anyone sees _____",
    "My love language is secretly _____",
    "The most chaotic thing in my apartment is _____",
    "I would become a criminal for unlimited _____",
    "My group vacation role is always _____",
    "The worst advice I ever followed was about _____",
]

PITCH_PROMPTS = [
    "Pitch a ridiculous startup idea in one sentence",
    "Sell a product that nobody needs",
    "Pitch a movie starring household objects",
    "Convince us to buy invisible socks",
    "Pitch an app that solves a problem you created",
    "Sell bottled air from famous cities",
    "Pitch a subscription box for things you already own",
    "Convince investors that sleep is optional",
    "Pitch a restaurant where every dish is beige",
    "Sell a gym membership for your fingers",
    "Pitch a dating app based only on fridge contents",
    "Convince us that hats for dogs are the future",
    "Pitch a cryptocurrency backed by group chat drama",
    "Sell a haunted smart home package",
    "Pitch a theme park for people who hate fun",
]

TEXT_TRANSFORMS = [
    'Translate to internet speak: "Hello, how are you today?"',
    'Make this a clickbait headline: "Local man finds thing"',
    'Rewrite as a passive-aggressive email: "Please submit your report"',
    'Turn into a movie tagline: "A man walks into a bar"',
    'Rewrite as a breakup text: "We need to talk"',
    'Make this sound like a legal disclaimer: "Have fun tonight"',
    'Rewrite as a villain monologue: "I just want peace"',
    'Turn into a Yelp review: "The food was fine"',
    'Rewrite as a conspiracy tweet: "The sky is blue"',
    'Make this sound like a TED talk title: "I lost my keys"',
]

WORD_CHAIN_SEEDS = [
    "Summer vacation", "Ocean breeze", "Music festival", "Adventure time", "Pizza night",
    "Chaos theory", "Moonlight drive", "Road trip vibes", "Karaoke bar", "Mystery box",
    "Campfire stories", "Neon lights", "Thunder storm", "Velvet rope", "Pirate treasure",
    "Glitch mode", "Waffle house", "Midnight snack", "Jungle gym", "Robot dance",
    "Festival season", "Storm chasing", "Bubble bath", "Desert island", "Galaxy brain",
    "Puzzle palace", "Dragon energy", "Carnival games", "Ghost pepper", "Laser tag",
    "Banana republic", "Coffee break", "Disco fever", "Electric sheep", "Frozen yogurt",
    "Golden hour", "Haunted house", "Ice sculpture", "Jazz hands", "Kung fu",
    "Lemonade stand", "Magic trick", "Night market", "Office party", "Pumpkin spice",
    "Quantum leap", "Rubber duck", "Space cowboy", "Taco Tuesday", "Undercover boss",
    "Vintage vinyl", "Water balloon", "X-ray vision", "Yacht rock", "Zombie prom",
]


def _dedupe_strings(items: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        key = item.strip().lower()
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(item.strip())
    return out


def _fill(template: str, **kwargs: str) -> str:
    try:
        return template.format(**kwargs)
    except KeyError:
        return template


def generate_quiplash(count: int = 500) -> list[str]:
    combos = []
    for tpl in QUIPLASH_TEMPLATES:
        for noun in NOUNS:
            combos.append(_fill(tpl, noun=noun, event=random.choice(EVENTS), place=random.choice(PLACES),
                                  topic=random.choice(TOPICS), food=random.choice(FOODS), animal=random.choice(ANIMALS),
                                  job=random.choice(JOBS), body_part=random.choice(BODY_PARTS),
                                  celebrity=random.choice(CELEBRITIES), situation=random.choice(SITUATIONS),
                                  adjective=random.choice(ADJECTIVES)))
    random.shuffle(combos)
    return _dedupe_strings(combos)[:count]


def generate_debate(count: int = 80) -> list[str]:
    return _dedupe_strings(DEBATE_TOPICS)[:count]


def generate_draw_guess(count: int = 350) -> list[str]:
    combos = []
    for tpl in DRAW_TEMPLATES:
        for animal in ANIMALS:
            combos.append(_fill(tpl, adjective=random.choice(ADJECTIVES), animal=animal,
                                  verb=random.choice(VERBS), place=random.choice(PLACES),
                                  object=random.choice(OBJECTS), clothing=random.choice(CLOTHING),
                                  vehicle=random.choice(VEHICLES), job=random.choice(JOBS),
                                  event=random.choice(EVENTS), food=random.choice(FOODS),
                                  topic=random.choice(TOPICS)))
    random.shuffle(combos)
    return _dedupe_strings(combos)[:count]


def generate_shirt_designs(count: int = 120) -> list[str]:
    combos = []
    for slogan in SHIRT_SLOGANS:
        combos.append(f'Design a shirt: "{slogan}"')
    for tpl in SHIRT_TEMPLATES:
        for noun in NOUNS[:20]:
            combos.append(_fill(tpl, slogan=random.choice(SHIRT_SLOGANS), food=random.choice(FOODS),
                                  job=random.choice(JOBS), event=random.choice(EVENTS),
                                  adjective=random.choice(ADJECTIVES), noun=noun, topic=random.choice(TOPICS),
                                  animal=random.choice(ANIMALS)))
    return _dedupe_strings(combos)[:count]


def generate_fibbage(count: int = 200) -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    seen: set[str] = set()
    for prompt, truth in FIBBAGE_FACTS:
        key = prompt.lower()
        if key in seen:
            continue
        seen.add(key)
        if "_____" not in prompt:
            prompt = prompt.replace(truth, "_____") if truth in prompt else f"{prompt} _____"
        out.append({"prompt": prompt, "truth": truth})
    # Template expansion
    templates = [
        "Scientists once believed that {thing} could {verb}.",
        "In {place}, people used {thing} as currency.",
        "The ancient word for {thing} also meant {other}.",
        "A little-known law in {place} requires {thing}.",
        "The world's largest collection of {thing} is in {place}.",
    ]
    things = ["rubber ducks", "spoons", "candles", "socks", "pigeons", "marbles", "buttons", "feathers"]
    verbs = ["cure hiccups", "predict weather", "repel sharks", "improve Wi-Fi", "summon rain"]
    others = ["chaos", "destiny", "lunch", "friendship", "regret"]
    places = ["Iceland", "Peru", "Japan", "Norway", "Canada", "Australia"]
    for tpl, thing, verb, other, place in itertools.product(templates, things, verbs, others, places):
        prompt = tpl.format(thing=thing, verb=verb, other=other, place=place)
        truth = random.choice([thing, verb, other, place])
        blanked = prompt.replace(truth, "_____")
        key = blanked.lower()
        if key not in seen:
            seen.add(key)
            out.append({"prompt": blanked, "truth": truth})
        if len(out) >= count:
            break
    return out[:count]


def generate_rank(count: int = 60) -> list[str]:
    out = []
    for label, items in RANK_SETS:
        out.append(f"Rank these from best to worst: {label} — {', '.join(items)}")
    for label, items in RANK_SETS:
        for drop in range(len(items) - 3):
            subset = items[:4 + drop]
            out.append(f"Rank these from best to worst: {label} — {', '.join(subset[:5])}")
    return _dedupe_strings(out)[:count]


def generate_sort(count: int = 60) -> list[str]:
    out = []
    for label, items in SORT_SETS:
        out.append(f"Sort these oldest to newest: {label} — {', '.join(items)}")
        out.append(f"Sort these smallest to largest: {label} — {', '.join(reversed(items))}")
    return _dedupe_strings(out)[:count]


def generate_bracket(count: int = 40) -> list[str]:
    return _dedupe_strings(BRACKET_TOPICS)[:count]


def generate_role_label(count: int = 40) -> list[str]:
    return _dedupe_strings(ROLE_LABELS)[:count]


def generate_teamwork(count: int = 50) -> list[str]:
    return _dedupe_strings(TEAMWORK_PROMPTS)[:count]


def generate_hidden_task(count: int = 50) -> list[str]:
    return _dedupe_strings(HIDDEN_TASKS)[:count]


def generate_finish_sentence(count: int = 40) -> list[str]:
    return _dedupe_strings(FINISH_SENTENCES)[:count]


def generate_pitch(count: int = 40) -> list[str]:
    return _dedupe_strings(PITCH_PROMPTS)[:count]


def generate_text_transform(count: int = 40) -> list[str]:
    return _dedupe_strings(TEXT_TRANSFORMS)[:count]


def generate_word_chain(count: int = 80) -> list[str]:
    return _dedupe_strings(WORD_CHAIN_SEEDS)[:count]


def generate_synthetic_mc(count: int = 500) -> list[dict[str, str | list[str]]]:
    """Template-generated MC questions to supplement API fetches."""
    capitals = [
        ("France", "Paris", ["Lyon", "Marseille", "Nice"]),
        ("Japan", "Tokyo", ["Osaka", "Kyoto", "Sapporo"]),
        ("Brazil", "Brasília", ["Rio de Janeiro", "São Paulo", "Salvador"]),
        ("Canada", "Ottawa", ["Toronto", "Vancouver", "Montreal"]),
        ("Australia", "Canberra", ["Sydney", "Melbourne", "Perth"]),
        ("Germany", "Berlin", ["Munich", "Hamburg", "Frankfurt"]),
        ("Italy", "Rome", ["Milan", "Naples", "Florence"]),
        ("Spain", "Madrid", ["Barcelona", "Seville", "Valencia"]),
        ("Mexico", "Mexico City", ["Guadalajara", "Monterrey", "Cancún"]),
        ("Egypt", "Cairo", ["Alexandria", "Giza", "Luxor"]),
        ("Turkey", "Ankara", ["Istanbul", "Izmir", "Bursa"]),
        ("Thailand", "Bangkok", ["Chiang Mai", "Phuket", "Pattaya"]),
        ("Norway", "Oslo", ["Bergen", "Trondheim", "Stavanger"]),
        ("Sweden", "Stockholm", ["Gothenburg", "Malmö", "Uppsala"]),
        ("Poland", "Warsaw", ["Kraków", "Gdańsk", "Wrocław"]),
        ("Argentina", "Buenos Aires", ["Córdoba", "Rosario", "Mendoza"]),
        ("South Africa", "Pretoria", ["Cape Town", "Johannesburg", "Durban"]),
        ("New Zealand", "Wellington", ["Auckland", "Christchurch", "Queenstown"]),
        ("South Korea", "Seoul", ["Busan", "Incheon", "Daegu"]),
        ("India", "New Delhi", ["Mumbai", "Kolkata", "Chennai"]),
    ]
    elements = [
        ("Gold", "Au", ["Ag", "Fe", "Cu"]),
        ("Silver", "Ag", ["Au", "Pb", "Zn"]),
        ("Iron", "Fe", ["Cu", "Sn", "Ni"]),
        ("Copper", "Cu", ["Co", "Cr", "Cd"]),
        ("Sodium", "Na", ["So", "Sa", "Nm"]),
        ("Potassium", "K", ["P", "Pt", "Kr"]),
        ("Calcium", "Ca", ["C", "Cl", "Co"]),
        ("Helium", "He", ["H", "Ho", "Hg"]),
        ("Oxygen", "O", ["Ox", "Og", "Os"]),
        ("Carbon", "C", ["Ca", "Co", "Cr"]),
    ]
    out: list[dict] = []
    for country, cap, wrong in capitals:
        out.append({
            "question": f"What is the capital of {country}?",
            "answer": cap,
            "distractors": wrong,
        })
        out.append({
            "question": f"Which city is the capital of {country}?",
            "answer": cap,
            "distractors": wrong,
        })
    for name, sym, wrong in elements:
        out.append({
            "question": f"What is the chemical symbol for {name}?",
            "answer": sym,
            "distractors": wrong,
        })
    years = [
        ("World War II end", "1945", ["1944", "1946", "1939"]),
        ("First Moon landing", "1969", ["1968", "1971", "1975"]),
        ("Titanic sinking", "1912", ["1905", "1920", "1898"]),
        ("Berlin Wall fall", "1989", ["1987", "1991", "1985"]),
        ("First iPhone release", "2007", ["2005", "2009", "2010"]),
    ]
    for event, year, wrong in years:
        out.append({
            "question": f"In what year did the {event} occur?",
            "answer": year,
            "distractors": wrong,
        })
    planets = [
        ("Mars", "Red Planet", ["Blue Planet", "Green Planet", "Gold Planet"]),
        ("Jupiter", "largest planet", ["Saturn", "Neptune", "Uranus"]),
        ("Mercury", "closest planet to the Sun", ["Venus", "Earth", "Mars"]),
        ("Saturn", "planet known for its rings", ["Jupiter", "Uranus", "Neptune"]),
    ]
    for planet, fact, wrong in planets:
        out.append({"question": f"Which planet is the {fact}?", "answer": planet, "distractors": wrong})
    authors = [
        ("1984", "George Orwell", ["Aldous Huxley", "Ray Bradbury", "Kurt Vonnegut"]),
        ("Pride and Prejudice", "Jane Austen", ["Charlotte Brontë", "Emily Brontë", "Virginia Woolf"]),
        ("The Great Gatsby", "F. Scott Fitzgerald", ["Ernest Hemingway", "John Steinbeck", "William Faulkner"]),
        ("Harry Potter series", "J.K. Rowling", ["C.S. Lewis", "Roald Dahl", "Philip Pullman"]),
        ("The Hobbit", "J.R.R. Tolkien", ["George R.R. Martin", "Ursula K. Le Guin", "Terry Pratchett"]),
    ]
    for book, author, wrong in authors:
        out.append({"question": f"Who wrote {book}?", "answer": author, "distractors": wrong})
    inventions = [
        ("the telephone", "Alexander Graham Bell", ["Thomas Edison", "Nikola Tesla", "Guglielmo Marconi"]),
        ("the light bulb", "Thomas Edison", ["Nikola Tesla", "Benjamin Franklin", "James Watt"]),
        ("the theory of relativity", "Albert Einstein", ["Isaac Newton", "Galileo Galilei", "Stephen Hawking"]),
        ("gravity laws", "Isaac Newton", ["Albert Einstein", "Johannes Kepler", "Nicolaus Copernicus"]),
        ("the polio vaccine", "Jonas Salk", ["Louis Pasteur", "Edward Jenner", "Alexander Fleming"]),
    ]
    for thing, person, wrong in inventions:
        out.append({"question": f"Who is credited with inventing or developing {thing}?", "answer": person, "distractors": wrong})
    numbers = [
        ("sides on a triangle", "3", ["4", "5", "6"]),
        ("days in a leap year", "366", ["365", "364", "367"]),
        ("players on a soccer team", "11", ["9", "10", "12"]),
        ("continents on Earth", "7", ["5", "6", "8"]),
        ("wonders of the ancient world traditionally listed", "7", ["5", "10", "12"]),
    ]
    for desc, num, wrong in numbers:
        out.append({"question": f"How many {desc} are there?", "answer": num, "distractors": wrong})
    countries_currency = [
        ("Japan", "Yen", ["Won", "Yuan", "Ringgit"]),
        ("United Kingdom", "Pound sterling", ["Euro", "Dollar", "Franc"]),
        ("Switzerland", "Swiss franc", ["Euro", "Krone", "Lira"]),
        ("India", "Rupee", ["Taka", "Rial", "Dinar"]),
    ]
    for country, currency, wrong in countries_currency:
        out.append({"question": f"What is the currency of {country}?", "answer": currency, "distractors": wrong})
    # Combinatorial geography expansion
    for c1, cap, wrong in capitals:
        for c2, cap2, _ in capitals:
            if c1 == c2:
                continue
            out.append({
                "question": f"Which city is the capital of {c1}, not {c2}?",
                "answer": cap,
                "distractors": [cap2, wrong[0], wrong[1]],
            })
    random.shuffle(out)
    return out[:count]


def generate_true_or_lie(count: int = 300) -> list[dict[str, bool]]:
    seen: set[str] = set()
    out: list[dict[str, bool]] = []
    for text, is_true in MISCONCEPTIONS:
        key = text.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append({"text": text, "isTrue": is_true})
    # Flip-a-fact variants for volume without spam
    templates_false = [
        "{subject} was invented in {year}.",
        "{subject} was discovered by {person}.",
        "The capital of {country} is {city}.",
    ]
    truths = [
        ("The telephone", "1876", False), ("The light bulb commercialization", "1879", True),
        ("Australia", "Canberra", True), ("Canada", "Toronto", False),
        ("Brazil", "Rio de Janeiro", False), ("Switzerland", "Zurich", False),
        ("Penicillin", "Alexander Fleming", True), ("Gravity discovery attribution", "Isaac Newton", True),
    ]
    extra_facts: list[tuple[str, bool]] = [
        ("The human body has 206 bones in adulthood.", True),
        ("Sharks do not have bones; their skeletons are cartilage.", True),
        ("Bananas are slightly radioactive due to potassium-40.", True),
        ("The speed of light is about 299,792 kilometers per second.", True),
        ("Sound travels faster in water than in air.", True),
        ("The Pacific Ocean is larger than all land area combined.", True),
        ("Antarctica is the driest continent on Earth.", True),
        ("The human heart has four chambers.", True),
        ("Spiders are arachnids, not insects.", True),
        ("Whales are mammals, not fish.", True),
        ("The Statue of Liberty was a gift from France.", True),
        ("The Amazon River carries more water than any other river.", True),
        ("Diamonds are made of carbon atoms.", True),
        ("The speed of sound is faster at sea level than at high altitude.", True),
        ("Jupiter has dozens of moons.", True),
        ("Saturn is less dense than water.", True),
        ("Neptune was discovered through mathematics before observation.", True),
        ("The human skeleton renews itself over about a decade.", True),
        ("Your brain uses about 20% of your body's energy.", True),
        ("Camels store fat in their humps, not water.", True),
        ("Bats are the only mammals capable of sustained flight.", True),
        ("The Great Barrier Reef is the largest coral reef system.", True),
        ("The Nile is often cited as the longest river.", True),
        ("Mount Everest is the highest point above sea level.", True),
        ("The Dead Sea is one of the saltiest bodies of water.", True),
        ("The human small intestine is about 20 feet long.", True),
        ("The liver is the largest internal organ.", True),
        ("Penguins live primarily in the Southern Hemisphere.", True),
        ("The cheetah is the fastest land animal over short distances.", True),
        ("The blue whale is the largest animal ever known.", True),
        ("The Earth is about 4.5 billion years old.", True),
        ("The Moon causes ocean tides.", True),
        ("Photosynthesis converts light into chemical energy.", True),
        ("DNA stands for deoxyribonucleic acid.", True),
        ("The Roman Empire fell in the west in 476 CE.", True),
        ("The printing press was popularized by Johannes Gutenberg.", True),
        ("The Wright brothers achieved powered flight in 1903.", True),
        ("Penicillin was discovered by Alexander Fleming.", True),
        ("The United Nations was founded in 1945.", True),
        ("The Internet originated from ARPANET research.", True),
        ("The first successful vaccine was for smallpox.", True),
        ("The human appendix is not vestigial in all scientific views.", True),
        ("Pluto was reclassified as a dwarf planet in 2006.", True),
        ("The human eye can detect a candle flame from miles away in darkness.", True),
        ("The Eiffel Tower was built for the 1889 World's Fair.", True),
        ("The Mona Lisa is housed in the Louvre.", True),
        ("The Colosseum is located in Rome.", True),
        ("The Taj Mahal is in India.", True),
        ("The Sydney Opera House is in Australia.", True),
        ("The human immune system can remember past infections.", True),
        ("Vaccines train the immune system without causing full disease.", True),
        ("Antibiotics kill bacteria, not viruses.", True),
        ("The boiling point of water lowers at higher altitude.", True),
        ("Lightning is hotter than the surface of the Sun.", True),
        ("The human body is about 60% water.", True),
        ("Humans have fewer genes than some grasses.", True),
        ("A day on Mercury is longer than its year.", True),
        ("There are more trees on Earth than stars in the Milky Way.", True),
        ("The Amazon produces about 20% of the world's oxygen.", False),
        ("Humans can see millions of distinct colors.", True),
        ("The human nose can detect over a trillion scents.", True),
        ("Crows can recognize human faces.", True),
        ("Elephants mourn their dead.", True),
        ("Dogs can smell some diseases.", True),
        ("Cats cannot taste sweetness.", True),
        ("A flamingo eats with its head upside down.", True),
        ("A snail can sleep for three years.", True),
        ("Horses cannot vomit.", True),
        ("Kangaroos cannot walk backward easily.", True),
        ("Owls cannot move their eyeballs.", True),
        ("Butterflies taste with their feet.", True),
        ("Starfish can regrow lost arms.", True),
        ("Jellyfish have no brain.", True),
        ("Crocodiles cannot stick out their tongues.", True),
        ("A shrimp's heart is in its head.", True),
        ("Mosquitoes are the deadliest animals to humans.", True),
        ("The mantis shrimp punches with bullet-like force.", True),
        ("The pistol shrimp creates a cavitation bubble hotter than the sun briefly.", True),
        ("The tongue is the strongest muscle by endurance.", False),
        ("Humans are born with blue eyes that may change color.", True),
        ("Your stomach gets a new lining every few days.", True),
        ("Fingernails grow faster in summer.", True),
        ("The hardest substance in the body is tooth enamel.", True),
        ("Humans are taller in the morning than at night.", True),
        ("Stress can turn hair gray faster.", True),
        ("The human brain weighs about three pounds.", True),
        ("Yawning cools the brain.", True),
        ("Laughing burns calories.", True),
        ("Crying produces different tears than cutting onions.", True),
        ("The heart can beat outside the body briefly with oxygen.", True),
        ("Blood makes up about 8% of body weight.", True),
        ("The small intestine is longer than the large intestine.", True),
        ("The appendix may help gut bacteria recover.", True),
        ("Humans shed about 1.5 pounds of skin yearly.", True),
        ("Dust in homes is mostly dead skin.", True),
        ("The strongest bone is the femur.", True),
        ("Babies are born without kneecaps.", True),
        ("The cornea gets oxygen from air, not blood.", True),
        ("Your left lung is smaller to make room for the heart.", True),
        ("The human body glows faintly.", True),
        ("Humans are bioluminescent but too weak to see.", True),
        ("The human body has more bacterial cells than human cells.", True),
        ("The average person walks about 70,000 miles in a lifetime.", True),
        ("The human heart beats over 3 billion times in a lifetime.", True),
        ("The human body produces enough saliva to fill two bathtubs.", True),
    ]
    for text, is_true in extra_facts:
        key = text.lower()
        if key not in seen:
            seen.add(key)
            out.append({"text": text, "isTrue": is_true})
    for tpl in templates_false:
        for subj, val, is_true in [
            ("The microwave oven", "1945", True), ("Bubble wrap", "1957", True),
            ("Velcro", "1941", True), ("Post-it notes", "1974", True),
            ("The frisbee", "1948", True), ("Silly Putty", "1943", True),
        ]:
            if "{subject}" in tpl:
                text = tpl.format(subject=subj, year=val, person=val, country=subj, city=val)
            else:
                continue
            key = text.lower()
            if key not in seen:
                seen.add(key)
                out.append({"text": text, "isTrue": is_true})
    return out[:count]