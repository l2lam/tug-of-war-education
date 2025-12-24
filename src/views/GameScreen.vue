<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../stores/game';
import { useGameLoop } from '../engine/GameLoop';
import PlayerArea from '../components/PlayerArea.vue';
import RopeAnimation from '../components/RopeAnimation.vue';
import { PLAYER_ID, SOUND_TYPE } from '../constants';
import { playSound, startBackgroundMusic, stopBackgroundMusic, setMusicVolume, MUSIC_TRACK } from '../services/audio';

const store = useGameStore();
const { startGameLoop, nextRound } = useGameLoop();

// Volume control
const savedVolume = localStorage.getItem('musicVolume');
const musicVolume = ref(savedVolume ? parseFloat(savedVolume) : 0.3);

function handleVolumeChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const volume = parseFloat(target.value);
  musicVolume.value = volume;
  setMusicVolume(volume);
  localStorage.setItem('musicVolume', volume.toString());
}

onMounted(() => {
  // Start background music with persisted volume
  startBackgroundMusic(MUSIC_TRACK.GAMEPLAY, musicVolume.value);
  
  if (store.state.isPlaying) {
    startGameLoop();
  }
});

// Watch for winner to play victory music
watch(() => store.state.winner, (winner: string | null) => {
  if (winner) {
    startBackgroundMusic(MUSIC_TRACK.VICTORY, musicVolume.value);
  }
});

onUnmounted(() => {
  // Stop background music when leaving the game screen
  stopBackgroundMusic();
});

function handleStart() {
  store.startGame(
    { name: 'PLAYER 1', difficulties: ['grade-1-math'] },
    { name: 'PLAYER 2', difficulties: ['grade-1-math'] }
  );
  startGameLoop();
}

function handleRematch() {
  // Navigate back to config screen to set up new game
  window.location.hash = '#config'; // Or use a proper navigation method
  // For now, just reload to config
  location.reload();
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
      } else if (store.state.winner) {
          // Play victory sound
          playSound(SOUND_TYPE.WIN);
      }
  }, 1000);
}

function getWinnerName() {
  if (!store.state.winner) return '';
  return store.state.winner === PLAYER_ID.LEFT 
    ? store.state.leftPlayer.name 
    : store.state.rightPlayer.name;
}

function getWinnerScore() {
  if (!store.state.winner) return 0;
  return store.state.winner === PLAYER_ID.LEFT 
    ? store.state.leftPlayer.score 
    : store.state.rightPlayer.score;
}

function getWinnerStrength() {
  if (!store.state.winner) return 0;
  return store.state.winner === PLAYER_ID.LEFT 
    ? store.state.leftPlayer.strength 
    : store.state.rightPlayer.strength;
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
        <button class="abort-btn" @click="store.abortGame()">ABORT</button>
      </div>
      <div class="volume-control">
        <label for="volume-slider">🔊</label>
        <input 
          id="volume-slider"
          type="range" 
          min="0" 
          max="1" 
          step="0.05" 
          :value="musicVolume" 
          @input="handleVolumeChange"
          class="volume-slider"
        />
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

    <!-- Victory Overlay - Street Fighter 2 Style -->
    <div v-if="store.state.winner" class="winner-overlay">
      <div class="victory-banner">
        <div class="winner-name">{{ getWinnerName() }}</div>
        <div class="wins-text">WINS!</div>
        <div class="ko-badge">K.O.</div>
      </div>
      
      <div class="victory-stats">
        <div class="stat-row">
          <span class="label">FINAL SCORE:</span>
          <span class="value">{{ getWinnerScore() }}</span>
        </div>
        <div class="stat-row">
          <span class="label">FINAL POWER:</span>
          <span class="value">{{ '⚡'.repeat(getWinnerStrength()) }}</span>
        </div>
      </div>
      
      <button class="rematch-btn arcade-btn" @click="handleRematch">CONTINUE</button>
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

.controls {
  display: flex;
  gap: 1rem;
}

.abort-btn {
  background: #ff0000;
  border-color: #aa0000;
  color: #fff;
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.abort-btn:hover {
  background: #ff4444;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.6);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.volume-control label {
  font-size: 1.2rem;
  cursor: pointer;
}

.volume-slider {
  width: 100px;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: #333;
  border: 2px solid #555;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #ffff00;
  border: 2px solid #fff;
  box-shadow: 0 0 5px rgba(255, 255, 0, 0.8);
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #ffff00;
  border: 2px solid #fff;
  box-shadow: 0 0 5px rgba(255, 255, 0, 0.8);
  cursor: pointer;
}

.volume-slider:hover::-webkit-slider-thumb {
  background: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

.volume-slider:hover::-moz-range-thumb {
  background: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
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
  background: radial-gradient(circle, rgba(0,0,0,0.95), rgba(0,0,0,1));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  z-index: 100;
  animation: fadeIn 0.5s ease-in;
}

.victory-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.winner-name {
  font-size: 4rem;
  font-weight: 900;
  color: #FFD700;
  text-shadow: 
    4px 4px 0px #ff0000,
    8px 8px 0px #000000;
  letter-spacing: 0.1em;
  animation: scaleIn 0.5s ease-out, pulse 2s infinite;
}

.wins-text {
  font-size: 3rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 
    3px 3px 0px #ff0000,
    6px 6px 0px #000000;
  letter-spacing: 0.2em;
}

.ko-badge {
  font-size: 5rem;
  font-weight: 900;
  color: #ff0000;
  text-shadow: 
    4px 4px 0px #000,
    -2px -2px 0px #fff;
  animation: rotate360 1s ease-in-out;
  margin-top: 1rem;
}

.victory-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(0,0,0,0.7);
  padding: 2rem 4rem;
  border: 4px solid #FFD700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.stat-row {
  display: flex;
  gap: 2rem;
  align-items: center;
  font-size: 1.5rem;
}

.stat-row .label {
  color: #aaa;
  font-weight: bold;
  min-width: 200px;
}

.stat-row .value {
  color: #FFD700;
  font-weight: 900;
  text-shadow: 2px 2px 0px #000;
}

.rematch-btn {
  font-size: 2rem;
  padding: 1rem 3rem;
  background: linear-gradient(180deg, #ff0000, #cc0000);
  color: #fff;
  border: 4px solid #fff;
  font-weight: 900;
  cursor: pointer;
  text-shadow: 2px 2px 0px #000;
  box-shadow: 
    0 4px 0px #660000,
    0 8px 20px rgba(0,0,0,0.5);
  transition: all 0.2s;
  animation: slideUp 1s ease-out 0.5s both;
}

.rematch-btn:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 8px 0px #660000,
    0 12px 30px rgba(0,0,0,0.7);
}

.rematch-btn:active {
  transform: translateY(2px);
  box-shadow: 
    0 2px 0px #660000,
    0 4px 10px rgba(0,0,0,0.5);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes rotate360 {
  from { transform: rotate(0deg) scale(0); }
  to { transform: rotate(360deg) scale(1); }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(50px); 
  }
  to { 
    opacity: 1;
    transform: translateY(0); 
  }
}
</style>
