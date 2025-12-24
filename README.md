# Tug-of-War Education 🎮📖

An educational, competitive arcade game where knowledge is power! Battle your friends in a classic Tug-of-War where answering questions correctly gives you the strength to pull the rope.

## 🚀 Features

- **Competitive Gameplay**: Two-player battle (Local VS).
- **Educational Topics**: Built-in topics for Math and Science, plus support for custom levels.
- **Dynamic Physics**: A velocity-based rope simulation with friction and momentum.
- **Retro Arcade Aesthetics**:
  - Dynamic glassmorphism UI.
  - Synthesized 8-bit music and sound effects using the Web Audio API.
- **Topics Editor**: Create and save your own custom question sets.
- **Persistent Settings**: Remembers player choices and volume settings across browser sessions.

## 🕹️ How to Play

1. **Battle Setup**: Enter player names and select one or more topics.
2. **Start the Fight**: Click **FIGHT!** to enter the arena.
3. **Answer & Pull**:
   - Questions appear for both players.
   - Answering **correctly** increases your pulling strength and adds to your score.
   - Answering **incorrectly** penalizes your strength.
   - High streaks increase your power even further!
4. **Victory**: The first player to pull the rope past the win threshold wins the match and a Heroic Fanfare!

## ⚙️ Configuration & Customization

### Topics

You can select multiple topics per player. Questions will be randomly drawn from the selected sets.

### Topics Editor & Custom Topics

Use the built-in Topics Editor to create custom challenges:

- **Create**: Add questions one by one with up to 4 options.
- **Save**: Topics are saved to your local browser storage and appear in the setup screen.
- **Import JSON**: You can bulk-import questions from a `.json` file.

#### JSON Import Format

To import questions, upload a JSON file containing an array of question objects following this schema:

```json
[
  {
    "id": "q1",
    "text": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctIndex": 2,
    "topic": "custom"
  },
  {
    "id": "q2",
    "text": "Solve: 5 * 5",
    "options": ["10", "25", "50", "5"],
    "correctIndex": 1,
    "topic": "custom"
  }
]
```

## 🏗️ Technical Architecture

This project is built with a modern, performance-oriented stack:

- **Frontend**: [Vue 3](https://vuejs.org/) with `<script setup>` and TypeScript for robust, reactive UI.
- **State Management**: [Pinia](https://pinia.vuejs.org/) handles the complex game state, player topics, and persistence.
- **Audio Engine**: A custom synthesizer built on the **Web Audio API**. It generates 8-bit waveforms (Square, Triangle) in real-time, featuring:
  - Procedural melody scheduling.
  - ADSR envelopes for "clean" retro sounds.
  - State-aware track switching (Menu/Gameplay/Victory).
- **Physics Engine**: A lightweight engine in `GameLoop.ts` that simulates:
  - Force-based acceleration ($F=ma$).
  - Velocity damping (friction).
  - Real-time rope displacement.

## 🛠️ Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---
*Created with ❤️ for Advanced Agentic Coding.*
