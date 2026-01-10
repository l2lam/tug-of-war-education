<script setup lang="ts">
const emit = defineEmits<{
  (e: 'back'): void;
}>();

function handleBack() {
  emit('back');
}
</script>

<template>
  <div class="about-screen">
    <a href="#" class="back-link" @click.prevent="handleBack">← Back to Config</a>
    
    <h1>🎓 Tug-of-War Education</h1>
    
    <div class="content">
      <section>
        <h2>About the Game</h2>
        <p>
          Tug-of-War Education is an interactive learning game where two players compete head-to-head
          by answering questions from various topics. Answer correctly and faster than your opponent
          to recruit powerful characters to your crew!
        </p>
      </section>

      <section>
        <h2>How to Play</h2>
        <ul>
          <li><strong>Answer Questions:</strong> Each round presents both players with a question from their selected topics</li>
          <li><strong>Speed Matters:</strong> The first player to select the correct answer wins the round</li>
          <li><strong>Build Your Crew:</strong> Win rounds to recruit animal characters (🐜 to 🐉) with varying strengths</li>
          <li><strong>Pull the Rope:</strong> Your crew's combined strength pulls the rope toward your side</li>
          <li><strong>Victory:</strong> Win by pulling the rope far enough to your side!</li>
        </ul>
      </section>

      <section>
        <h2>How to Configure</h2>
        <ul>
          <li><strong>Player Names:</strong> Set names for Player 1 (left) and Player 2 (right)</li>
          <li><strong>Select Topics:</strong> Each player chooses which topics they want to be quizzed on</li>
          <li><strong>Game Speed:</strong> Adjust the "Force Multiplier" slider to make the game faster or slower</li>
          <li><strong>Music Volume:</strong> Control background music volume</li>
          <li><strong>Custom Topics:</strong> Create your own custom topics with the "ADD CUSTOM TOPIC" button</li>
        </ul>
      </section>

      <section>
        <h2>Character System</h2>
        <p>
          Characters range from weak to powerful:
          🐜 Ant (1.0) → 🐁 Mouse (1.2) → 🐈 Cat (1.5) → 🐕 Dog (1.8) → 🐅 Tiger (2.0) → 
          🐎 Horse (2.2) → 🦏 Rhino (2.2) → 🐘 Elephant (3.0) → 🦖 T-Rex (4.0) → 🐉 Dragon (5.0)
        </p>
        <ul>
          <li>Win a round: recruit a random character (weaker characters are more common)</li>
          <li>Lose a round: lose your weakest crew member</li>
          <li>Crew limit: 6 characters maximum</li>
          <li>When at max capacity and you win, sabotage your opponent by removing their weakest member!</li>
        </ul>
      </section>

      <section>
        <h2>Open Source</h2>
        <p>
          This game is open source! Check out the code, contribute, or create your own version:
        </p>
        <a 
          href="https://github.com/l2lam/tug-of-war-education" 
          target="_blank" 
          rel="noopener noreferrer"
          class="github-link"
        >
          📂 View on GitHub
        </a>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: black;
  color: white;
  padding: 2rem;
  overflow-y: auto;
  position: relative;
}

.back-link {
  position: absolute;
  top: 1rem;
  left: 1rem;
  color: #888;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: white;
}

h1 {
  text-align: center;
  margin: 2rem 0 1rem 0;
  font-size: 2.5rem;
}

.content {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #111;
  border: 2px solid #333;
  border-radius: 8px;
}

h2 {
  color: #4CAF50;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

p {
  line-height: 1.6;
  margin: 0.5rem 0;
  color: #ccc;
}

ul {
  line-height: 1.8;
  color: #ccc;
  padding-left: 1.5rem;
}

li {
  margin-bottom: 0.5rem;
}

strong {
  color: white;
}

.github-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #333;
  color: white;
  text-decoration: none;
  border: 2px solid #555;
  border-radius: 4px;
  font-size: 1.1rem;
  transition: all 0.2s;
}

.github-link:hover {
  background: #4CAF50;
  border-color: #4CAF50;
  transform: translateY(-2px);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .about-screen {
    padding: 1rem;
  }

  h1 {
    font-size: 1.8rem;
    margin-top: 3rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  section {
    padding: 1rem;
  }

  ul {
    padding-left: 1rem;
  }
}

@media (max-height: 500px) and (orientation: landscape) {
  h1 {
    font-size: 1.5rem;
    margin: 1rem 0 0.5rem 0;
  }

  section {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
}
</style>
