# Voices of Void

**A dark sci-fi proto-language workbench for worldbuilders.**

> 🔗 **Live page:** <https://utkuefeayan.github.io/VoicesOfVoid/>

Voices of Void lets you quickly sketch out a fictional language — tweak grammar rules, phonology, and writing-system options, then instantly see sample words, sentences, and a mini-dictionary. It is built for rapid ideation rather than for designing one perfect conlang. No linguistics degree required.

---

## Table of Contents

1. [What It Does](#what-it-does)
2. [Interface Overview](#interface-overview)
3. [Left Panel — Controls Reference](#left-panel--controls-reference)
4. [Right Panel — Output Reference](#right-panel--output-reference)
5. [ⓘ Info Buttons](#ⓘ-info-buttons)
6. [Language Presets](#language-presets)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Known Limitations](#known-limitations)
9. [Resources & References](#resources--references)
10. [Artist Statement](#artist-statement)
11. [Postmortem](#postmortem)

---

## What It Does

| Feature | Description |
|---|---|
| **Language Presets** | One-click starting points (Elven, Dwarven, Robotic, Eldritch, etc.) |
| **Grammar Controls** | Word order, syllable pattern, max syllables per word |
| **Phonology Controls** | Custom consonant and vowel inventories |
| **Writing System Controls** | Script type (Alphabet, Abjad, Abugida, Featural) + text direction |
| **Alphabet Mapping** | See which English letters map to your language's phonemes |
| **Sample Sentences** | Auto-generated sentences that follow your language's rules |
| **Custom Sentence Translation** | Type any English sentence and get a conlang translation |
| **Custom Word Generator** | Enter an English word to get a phoneme-mapped conlang word |
| **Mini Dictionary** | Categorised word lists (nouns, verbs, descriptors, etc.) |

---

## Interface Overview

The app is split into two panels:

```
┌──────────────────────────┬────────────────────────────────────┐
│   LEFT PANEL             │   RIGHT PANEL                      │
│  ─ Language Presets      │  ─ Language name & tagline         │
│  ─ Grammar Controls      │  ─ Info cards (phonology, writing) │
│  ─ Phonology Controls    │  ─ Alphabet mapping grid           │
│  ─ Writing System        │  ─ Sample sentences + reroll       │
│  ─ Reset / Send buttons  │  ─ Custom sentence translator      │
│                          │  ─ Custom word generator           │
│                          │  ─ Mini dictionary + reroll        │
└──────────────────────────┴────────────────────────────────────┘
```

**Typical workflow:**
1. Click a **preset** to load a starting language.
2. Tweak any controls on the **left panel** to your liking.
3. Click **"send to generator"** to apply your changes and regenerate all output.
4. Use the **right panel** to explore words, sentences, and the dictionary.
5. Use **"reset to preset"** at any time to undo your tweaks.

---

## Left Panel — Controls Reference

### Language Presets

A row of quick-select buttons at the top of the left panel. Each preset loads a complete configuration (grammar, phonology, and writing system).

| Preset | Feel | Word Order |
|---|---|---|
| Elven | Bright vowels, flowing | VSO |
| Dwarven | Heavy clusters, chunky | SOV |
| Futuristic/Standard | Clean, efficient | SVO |
| Germanic | Gutturals, umlauts | SVO |
| Slavic | Dense clusters, palatal | SVO |
| Reptilian | Hissing sibilants | SOV |
| Robotic | Very regular, short words | SVO |
| Eldritch | Alien, harsh, unsettling | VSO |
| Cyberpunk | Sharp, fast, street-clipped | SVO |
| Steampunk | Old-industrial, formal | SVO |

---

### Grammar

| Control | What It Does |
|---|---|
| **Word Order** | Sets how subject (S), verb (V), and object (O) are ordered in sentences. *SVO* = "hunter sees wolf"; *SOV* = "hunter wolf sees"; *VSO* = "sees hunter wolf". |
| **Syllable Pattern** | Controls the consonant/vowel structure of each syllable. *CV* = simple (ba, mo); *CVC* = balanced (bat, sun); *CCVC* = complex clusters (str-, pli-). C = Consonant, V = Vowel, L = Liquid (r/l), S = Sibilant (s/z/sh), X = Flexible. |
| **Max Syllables Per Word** | Caps word length. 1–2 = short punchy words; 3–4 = balanced; 5+ = complex, flowing. |

---

### Phonology

| Control | What It Does |
|---|---|
| **Consonants** | Space-separated list of consonant sounds your language uses. Supports single letters (`b d f`), digraphs (`ch sh th`), and IPA symbols (`ʃ ʒ ŋ θ ð`). More consonants = more variety; fewer = simpler, more regular. |
| **Vowels** | Space-separated list of vowel sounds. Supports basic vowels (`a e i o u`), long vowels (`aa ee oo`), diphthongs (`ai au oi`), and IPA symbols (`æ ø ɔ ə`). Affects the "colour" and flow of pronunciation. |

---

### Writing System

| Control | What It Does |
|---|---|
| **System Type** | *Alphabet* — one symbol per sound (like English); *Abjad* — mostly consonants written (like Arabic); *Abugida* — consonant+vowel pairs (like Devanagari); *Featural* — each symbol encodes pronunciation features. Note: the alphabet grid display is currently used for all types. |
| **Direction** | *Left → Right (LTR)* — standard; *Right → Left (RTL)* — reversed (Eldritch preset uses this); *Top → Bottom (TTB)* — vertical; *Bottom → Top (BTT)* — rare vertical reverse. Direction affects how sample sentences and words are rendered. |

> ⚠️ **Note:** Script-direction controls are not yet fully perfect — see [Known Limitations](#known-limitations).

---

### Action Buttons

| Button | What It Does |
|---|---|
| **Reset to Preset** | Restores all controls to the values of the currently active preset, discarding any manual tweaks. |
| **Send to Generator** | Applies your current control values and regenerates all output on the right panel. |

---

## Right Panel — Output Reference

### Language Info Cards

After loading a preset or sending your config, four info cards appear:

| Card | Shows |
|---|---|
| **Sound Shape (phonology)** | Active word order, syllable pattern, and max syllables |
| **Word Building (morphology)** | Noun and verb richness, derivation style |
| **Dictionary Feel (lexicon)** | Lexicon size, proper-name density, etymological layering |
| **Script (writing)** | Writing system type and text-flow direction |

---

### Alphabet Mapping Grid

Shows how each English letter or digraph maps to a phoneme from your current inventory.

- **Top row** — English letter or combination (B, C, D … CH, SH, TH …)
- **Bottom row** — Corresponding conlang phoneme
- **—** (dash) — No phoneme available for that letter

Use this as a reference when creating custom words.

---

### Sample Sentences

Three auto-generated sentences in your language, each shown with an English gloss beneath it.

| Button | What It Does |
|---|---|
| **reroll** | Generates three brand-new sentences using the current lexicon |

---

### Custom Sentence Translator

Type any simple English sentence and convert it into your conlang.

**How it works:**
1. Type an English sentence in the text area (e.g., *"the hunter sees the wolf"*).
2. Click **translate** (or press `Ctrl + Enter`).
3. Each word is looked up in the current lexicon; unknown words get a freshly generated conlang word on the spot.
4. All newly coined words are saved to the **Custom Translations** section of the dictionary.

---

### Custom Word Generator

Turn any English word into a conlang word via the alphabet mapping.

**How it works:**
1. Type an English word in the input field (e.g., *"hello"*).
2. Click **generate** (or press `Enter`).
3. Each letter is mapped to a phoneme from your inventory (digraphs like *ch*, *th*, *ai* are handled first).
4. Unmapped characters are skipped.

---

### Mini Dictionary

A categorised word list showing the current lexicon split into:
**Nouns · Verbs · Descriptors · Prepositions · Pronouns · Conjunctions · Articles · Custom Translations**

| Button | What It Does |
|---|---|
| **reroll** | Regenerates *all* word categories with a fresh set of phoneme combinations. Your custom translations are preserved. |

---

## ⓘ Info Buttons

Nearly every control on the left panel — and a few output sections on the right — has a small **ⓘ** button next to its label.

**Click any ⓘ button** to open a pop-up panel that explains:
- What the control does
- The available options and their effects
- A concrete example

Close the pop-up by clicking the **×** button, pressing the `Escape` key, or clicking anywhere outside the pop-up panel.

Controls that have ⓘ buttons:

| Control | Info Covers |
|---|---|
| Word Order | S/V/O definitions and all five orderings with examples |
| Syllable Pattern | What C, V, X, L, S stand for; pattern examples |
| Max Syllables Per Word | How word length changes the feel of the language |
| Consonants | Tips on using IPA symbols, digraphs, inventory size effects |
| Vowels | Basic, long, diphthong, and IPA options explained |
| Writing System Type | All four system types with real-world analogues |
| Script Direction | All four directions with real-world examples |
| Phoneme Inventory (alphabet grid) | How to read the mapping grid |
| Translate Your Own Sentence | Step-by-step walkthrough of the translator |
| Create Custom Word | How letter-to-phoneme mapping works |

---

## Language Presets

Each preset is a complete starting configuration. You can load one and then fine-tune any setting manually before clicking **"send to generator"**.

| Preset | Syllable Pattern | Max Syllables | Writing Direction |
|---|---|---|---|
| Elven | CVC | 4 | LTR |
| Dwarven | CCVC | 3 | LTR |
| Futuristic/Standard | CVC | 4 | LTR |
| Germanic | CCVC | 3 | LTR |
| Slavic | CCVC | 4 | LTR |
| Reptilian | CVC | 3 | LTR |
| Robotic | CV | 2 | LTR |
| Eldritch | CCVC | 4 | RTL |
| Cyberpunk | CVC | 2 | LTR |
| Steampunk | CCVC | 4 | LTR |

---

## Keyboard Shortcuts

| Shortcut | Where | Action |
|---|---|---|
| `Ctrl + Enter` | Custom Sentence Translator | Translate the sentence |
| `Enter` | Custom Word Generator | Generate the conlang word |
| `Escape` | Any open ⓘ pop-up | Close the info panel |

---

## Known Limitations

- **Script direction** — RTL, TTB, and BTT directions are partially implemented; display may not be fully correct in all browsers.
- **Word generation realism** — Generated words follow phonological rules but do not yet achieve the structured, natural feel of real-world languages. Markov-chain approaches were explored but proved incompatible with the rule-based generator, so the current semi-random approach is intentional.
- **Writing-system rendering** — The alphabet grid always shows an alphabet-style mapping regardless of which writing-system type is selected.

---

## Resources & References

### Conlanging & Linguistics

- <https://conlanging.com/>
- <https://tmkohl.com/category/worldbuilding/conlanging-101/> *(used heavily as a reference)*
- <https://www.vulgarlang.com/>
- <https://glyphy.io/font-generator/weird-text>
- <https://academy.worldanvil.com/blog/sci-fi-worldbuilding-guide>

### YouTube

- <https://www.youtube.com/@WorldbuildingCorner> *(great worldbuilding channel)*
- <https://www.youtube.com/watch?v=5OGDlp2XIdg>
- <https://www.youtube.com/watch?v=bjDqBz7kw1M>
- <https://www.youtube.com/watch?v=i1FeOOhNnwU>
- <https://www.youtube.com/watch?v=Qhaz36TZG5Y>
- <https://www.youtube.com/watch?v=VkWJQe_EsjQ>
- <https://www.youtube.com/watch?v=wsTv9y931o8>
- <https://www.youtube.com/watch?v=VlvNZP3kugI>
- <https://www.youtube.com/watch?v=jcc40AowXPQ>
- <https://www.youtube.com/watch?v=_Wj1pjq0uNQ>
- <https://www.youtube.com/watch?v=bjFvRnCYzN4>
- <https://www.youtube.com/watch?v=1L2YiWdaUDM&list=PL4-IK0AVhVjOJs_UjdQeyEZ_cmEV3uJvx> *(playlist)*
- <https://www.youtube.com/watch?v=i3AkTO9HLXo&list=PLM8wYQRetTxBkdvBtz-gw8b9lcVkdXQKV> *(playlist)*
- <https://www.youtube.com/watch?v=FHK1gO2Mh68&list=PL6xPxnYMQpqsooCDYtQQSiD2O3YO0b2nN> *(playlist)*

### ChatGPT Chats (for transparency)

| Chat | Purpose |
|---|---|
| [Vocabulary JSON generation](https://chatgpt.com/share/692bce30-703c-800a-b1aa-09e0a5f1b319) | Used to fill out the large `vocabulary.json` file; words were later simplified for better generation quality |
| [Initial ideation](https://chatgpt.com/share/692c0ead-ef90-800a-bb6c-3e28d2dcb23c) | Early project structure ideas |
| [style.css / index.html / ui.js ideation](https://chatgpt.com/share/692e5fcc-0468-800a-8c88-8b2b82ce40e6) | UI styling templates and structure; required significant manual tweaking |
| [Presets structure](https://chatgpt.com/share/692bc300-3e94-800a-860e-38db08fd6e88) | Main preset structure scaffolding; consonants/vowels refined manually |

*(Grammarly was used for grammar correction and punctuation throughout the project.)*

---

## Artist Statement

I decided to do this project because of my passion for worldbuilding. I really enjoy exploring different, unique worlds — especially through reading or playing games, since those tend to be more immersive in their world-building. Some of my favourites are Warhammer (both 30k/Horus Heresy and 40k), Bloodborne (as well as Dark Souls and Elden Ring), SCP Containment Breach, Dune, The Witcher, and D&D, among others.

I love spending hours digging through lore, learning how these worlds fit together. One of my guilty pleasures is watching hours of lore videos on YouTube while I have free time or am doing easy work. I have also played and hosted some D&D campaigns. I enjoy amateur worldbuilding myself, so I wanted to create a tool that I or others who want to enrich their worlds through languages — or who just want to explore languages in a worldbuilding context — could use to ideate, experiment, and quickly sketch out how a fictional language might look, or how a fictional or fantasy creature might sound, without needing to fully master linguistics or spend months building a single conlang for a single idea.

This tool is more focused on rapid ideation rather than trying to design one perfect language. The project builds a flexible language-generation workbench with a dark, sci-fi theme (because I like that kind of aesthetic), where you can tweak grammar settings, phonology, and writing-system options, then instantly see sample words, sentences, and mini-dictionaries. It is part toy, part design tool, and part an excuse for me to dive deeper into the logistics of linguistics and worldbuilding.

---

## Postmortem

*(Grammarly used for grammar correction and punctuation.)*

I think I bit off more than I could chew with some stuff, especially my original idea of having both a custom glyph generator that would generate unique glyphs for each language. As I started working on it and doing more research on word generation, sentence generation, and conlanging, I realised how complicated things were, so I decided to focus only on the language part rather than glyph generation. I ditched graphic glyph generation entirely and switched to using different pre-made letters and more exotic alphabet-character integration instead of building from zero.

Condensing my efforts helped a lot; however, the UI, `style.css`, and HTML parts took a very long time — especially the HTML, since I am not great at HTML. Even though I ideated using ChatGPT for templates and structure, it could not do exactly what I wanted, so I needed to tweak and fix things a lot, especially for moving parts like the sentence generator and the dictionaries with drop-down menus. I made some cool drop-down selection menus and a good interface, and it became one of the parts I am very proud of, even though they are not perfect.

Then there is the generation logic, which I thought would be easy since I had so many rules. It was not. It is a thousand times better than where it started, especially for generating sentences and words and following all the rules (I think). However, it still cannot generate words with the natural, structured feel we see in real languages. I spent a lot of time looking for language-generation logic and algorithms online, but everything I found either used external APIs or logic so complex I had no idea what it was doing — even after watching videos or reading about it. Markov chains were explored, but the easy implementation people used was not compatible with my rule-based logic, and the more advanced approaches were a completely new topic for me. I realised that trying to make them work together with my rule-based system was futile, so I accepted the current level of generation. It is not bad, but not the perfect version I wanted. Still, it works and looks relatively good — and generation was definitely the hardest part.
