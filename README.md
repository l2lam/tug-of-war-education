# Tug-of-War Education 🎮📖

An educational, competitive arcade game where knowledge is power! Battle your friends in a classic Tug-of-War where answering questions correctly gives you the strength to pull the rope.

## 🚀 Features

- **Competitive Gameplay**: Two-player battle (Local VS).
- **Educational Topics**: Built-in topics for Math and Science, plus support for custom levels.
- **Mathematical Rendering**: MathJax integration for beautiful rendering of mathematical symbols and equations using AsciiMath syntax.
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
    "correctIndex": 2
  },
  {
    "id": "q2",
    "text": "Solve: 5 * 5",
    "options": ["10", "25", "50", "5"],
    "correctIndex": 1
  }
]
```

> [!NOTE]
> The **Topic** name is automatically assigned based on the **filename**. For example, if you import `capitals.json`, the topic will be named "capitals".
>
### Mathematical Notation with MathJax

The game uses **MathJax** with **AsciiMath** syntax to render mathematical symbols and equations beautifully. To include math in your questions or answers, wrap mathematical expressions in backticks (`` ` ``).

#### AsciiMath Syntax Examples

```json
{
  "id": "math-example",
  "text": "Solve for x: `3x + 5 = 20`",
  "options": [
    "`x = 5`",
    "`x = 15`",
    "`x = 10`",
    "`x = 25`"
  ],
  "correctIndex": 0
}
```

**Common AsciiMath notation:**

- **Fractions**: `` `a/b` `` renders as a/b
- **Exponents**: `` `x^2` `` renders as x²
- **Subscripts**: `` `H_2O` `` renders as H₂O
- **Square roots**: `` `sqrt(x)` `` renders as √x
- **Greek letters**: `` `alpha`, `beta`, `pi` `` render as α, β, π
- **Comparison**: `` `x <= 5` `` renders as x ≤ 5
- **Set notation**: `` `x in [1, 10]` `` renders with ∈ symbol
- **Statistics**: `` `bar x` `` for mean, `` `mu` `` for μ, `` `sigma` `` for σ

For more AsciiMath syntax, see the [AsciiMath reference](http://asciimath.org/).

> [!IMPORTANT]
> MathJax requires an internet connection to load from the CDN. Ensure you're online when playing with math-heavy topics.

### Dynamic Questions

You can create questions with randomized numbers using the `variables` property. The system will auto-generate values and evaluate math expressions.

```json
{
  "id": "dyn-1",
  "text": "What is {{A}} + {{B}}?",
  "variables": {
    "A": { "min": 1, "max": 10 },
    "B": { "min": 1, "max": 10 }
  },
  "options": [
    "{{A + B}}",       // Correct answer (evaluated)
    "{{A + B + 1}}",   // Distractor
    "{{A - B}}",       // Distractor
    "{{A * B}}"        // Distractor
  ],
  "correctIndex": 0
}
```

Expressions inside `{{ }}` are evaluated safely. You can use standard math operators: `+`, `-`, `*`, `/`, `()`.

## 🏗️ Technical Architecture

This project is built with a modern, performance-oriented stack:

- **Frontend**: [Vue 3](https://vuejs.org/) with `<script setup>` and TypeScript for robust, reactive UI.
- **State Management**: [Pinia](https://pinia.vuejs.org/) handles the complex game state, player topics, and persistence.
- **Mathematical Rendering**: [MathJax 3](https://www.mathjax.org/) via CDN with AsciiMath input processor. A custom `MathJaxRenderer` Vue component handles dynamic typesetting of question and answer content.
- **Audio Engine**: A custom synthesizer built on the **Web Audio API**. It generates 8-bit waveforms (Square, Triangle) in real-time, featuring:
  - Procedural melody scheduling.
  - ADSR envelopes for "clean" retro sounds.
  - State-aware track switching (Menu/Gameplay/Victory).
- **Physics Engine**: A lightweight engine in `GameLoop.ts` that simulates:
  - Force-based acceleration ($F=ma$).
  - Velocity damping (friction).
  - Real-time rope displacement.

## � Service Providers

This application supports two data backends, which can be toggled in your **`.env`** file:

- **Mock (Default)**: Uses local `localStorage` and the built-in JSON library in `src/data/topics/`.
- **Supabase**: Uses a remote Supabase instance for topics, questions, and player configurations.

To switch, modify the following line in `.env`:

```bash
VITE_USE_SUPABASE=false # Set to true to enable Supabase
```

## �🛠️ Development Setup

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
