<<<<<<< codex/build-a-browser-based-study-game-for-french-3
# Grand Concours Level 3 Arena (D’accord! 3 Leçons 1–8)

A complete browser-based study game for **AATF Le Grand Concours Level 3** focused on:
- listening comprehension,
- reading comprehension,
- language-in-context (grammar + vocabulary chunks together).

## Project structure

```text
.
├── index.html
├── src/
│   ├── app.js
│   ├── game.js
│   ├── srs.js
│   └── storage.js
├── styles/
│   └── app.css
├── data/
│   ├── grammar_topics.json
│   ├── vocab_entries.json
│   ├── chunk_entries.json
│   └── question_bank.json
├── scripts/
│   ├── ingest_study_guides.py
│   ├── generate_seed_data.py
│   └── validate_data.py
└── study_guides/ (optional input files)
```

## Implemented game modes

1. **Quick Start (Daily Session)** – auto mix with weak-topic summary and top missed words.
2. **Grammar Arcade** – trigger-based context drills.
3. **Vocabulary Quest** – chunk-based recognition and production-light items.
4. **Listening Lab** – MCQ listening with Web Speech API fallback and “listen twice”.
5. **Reading Runner** – contest-style reading MCQ.
6. **Mock Exam** – timed 30-question simulation.
7. **Boss Battles** – high-yield trap clusters.
8. **Question Starter Words Pack** – timed starter drills + logic hooks.
9. **là/la/l’a Pack** – accent confusion mini-lesson.
10. **Mistake Notebook** – filtering, redo, mini-test, CSV export.
11. **Teacher Mode** – hide answers, timer controls, lesson selection.

## Data model coverage

The app uses these entities in local JSON + localStorage state:
- `UserProfile`
- `Lesson`
- `GrammarTopic`
- `VocabEntry`
- `ChunkEntry`
- `Question`
- `QuestionAttempt`
- `MistakeLog`
- `ReviewSchedule`

## Seed content

Generated data files include:
- `grammar_topics.json`
- `vocab_entries.json` (2,900+)
- `chunk_entries.json` (220+)
- `question_bank.json` (1,600+ questions, 12 question types)

### Question types included
- Multiple choice
- Fill blank
- Pronoun replacement
- Pronoun order puzzle
- Tense choice
- Negation placement
- Article choice
- Question-word selection
- Listening MCQ
- Reading MCQ
- Speed round
- Error spotting

## Content pipeline

### 1) Ingest study guides (primary input files)
Put provided guides in `study_guides/`, e.g.:
- Le Grand Concours Study Guide (Level 3), D’accord! 3 aligned Leçons 1–8
- Le Grand Concours Level 3 Study Guide (general)
- Le Grand Concours Level 3 Study Guide FIXED
- Le Grand Concours Study Guide UPDATED
- Optional HTML version

Run:

```bash
python3 scripts/ingest_study_guides.py
```

Output:
- `data/ingested_summary.json` with grammar hits, top words, and chunk candidates.

### 2) Generate/expand seed banks

```bash
python3 scripts/generate_seed_data.py
```

### 3) Validate acceptance thresholds

```bash
python3 scripts/validate_data.py
```

## Run locally

No npm install required.

```bash
python3 -m http.server 4173
# then open http://localhost:4173
```

## Offline behavior

All practice data is local JSON and user progress is persisted in browser localStorage.
Listening uses browser TTS when available.

## Notes

- The game prioritizes speed + accuracy and logs trigger-based mistakes.
- Spaced repetition is implemented using an adaptive Leitner-like schedule based on:
  correctness, response speed, streak, and trap category.
=======
# Grand Concours L3 Offline (Single File)

This project now provides a **single self-contained file**:

- `index.html`

It contains all HTML, CSS, JavaScript, grammar data, vocabulary chunks, and question bank.

## Run

Just double-click `index.html` in any modern browser.
No npm, no server, no build tools, no backend.

## Included features

- Quick Start mode
- Grammar mode
- Vocabulary mode
- Mixed practice mode
- Timed multiple-choice questions
- Pronoun drills
- Tense drills (passé composé, imparfait, futur proche, futur simple)
- Subjunctive recognition
- Article drills (du, de la, des, de after negation)
- Question word drills
- Accent confusion drills (où/ou, là/la/l’a, a/à)
- Local score tracking with localStorage
>>>>>>> main
