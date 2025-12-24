<script setup lang="ts">
import { onMounted } from 'vue';
import { useGameStore } from '../stores/game';
import { useGameLoop } from '../engine/GameLoop';
import PlayerArea from '../components/PlayerArea.vue';
import RopeAnimation from '../components/RopeAnimation.vue';
import { PLAYER_ID, SOUND_TYPE } from '../constants';
import { playSound } from '../services/audio';

const store = useGameStore();
const { startGameLoop, nextRound } = useGameLoop();

onMounted(() => {
  if (store.state.isPlaying) {
    startGameLoop();
  }
});

function handleStart() {
  store.startGame(
    { name: 'PLAYER 1', difficulties: ['grade-1-math'] },
    { name: 'PLAYER 2', difficulties: ['grade-1-math'] }
  );
  startGameLoop();
}

function handleAnswer(playerId: typeof PLAYER_ID.LEFT | typeof PLAYER_ID.RIGHT, isCorrect: boolean) {
  if (store.state.isTransitioning) return;
  store.state.isTransitioning = true;
  
  store.answerQuestion(playerId, isCorrect);
  if (isCorrect) {
      playSound(SOUND_TYPE.HIT);
  } else {
      playSound(SOUND_TYPE.MISS);
  }

  // Trigger next round after a short delay to see result
  setTimeout(() => {
      // Only advance if still playing (game might end on win condition in answerQuestion)
      if (store.state.isPlaying) {
          nextRound();
      }
  }, 1000);
}

</script>

<template>
  <div class="game-screen">
    <div class="header-bar">
      <div class="timer">{{ store.state.timeLeft }}</div>
      <div class="round">ROUND {{ store.state.round }}</div>
      <div class="controls">
        <button v-if="!store.state.isPlaying" @click="handleStart">START FIGHT!</button>
        <button v-else @click="store.state.isPaused = !store.state.isPaused">
          {{ store.state.isPaused ? 'RESUME' : 'PAUSE' }}
        </button>
      </div>
    </div>

    <!-- Rope Section -->
    <RopeAnimation />

    <!-- Players Section -->
    <div class="players-container">
      <PlayerArea 
        :player="store.state.leftPlayer" 
        color="#e63946"
        :disabled="store.state.isTransitioning || store.state.isPaused"
        @answer="(c) => handleAnswer(PLAYER_ID.LEFT, c)"
      />
      <div class="vs-divider">VS</div>
      <PlayerArea 
        :player="store.state.rightPlayer" 
        color="#457b9d"
        :disabled="store.state.isTransitioning || store.state.isPaused"
        @answer="(c) => handleAnswer(PLAYER_ID.RIGHT, c)"
      />
    </div>

    <!-- Verify Win Overlay -->
    <div v-if="store.state.winner" class="winner-overlay">
      <h1>{{ store.state.winner.toUpperCase() }} WINS!</h1>
      <button @click="handleStart">REMATCH</button>
    </div>
  </div>
</template>

<style scoped>
.game-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
}

.header-bar {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  background: #000;
  border-bottom: 2px solid #555;
  font-size: 1.5rem;
  font-weight: bold;
}

.timer {
  color: yellow;
}

.players-container {
  flex: 1;
  display: flex;
  padding: 1rem;
  gap: 1rem;
  align-items: stretch;
}

.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 900;
  color: #ff0;
  text-shadow: 4px 4px 0px #f00;
  font-style: italic;
}

.winner-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  color: #fff;
  font-size: 3rem;
}
</style>
