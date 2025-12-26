<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { PlayerState } from '../types';

const props = defineProps<{
  player: PlayerState;
  color: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'answer', isCorrect: boolean): void;
}>();

const currentQuestion = computed(() => props.player.currentQuestion);

// Randomize option order while tracking original indices
const shuffledOptions = ref<{ opt: string; originalIdx: number }[]>([]);

watch(currentQuestion, (newQ) => {
  if (!newQ) {
    shuffledOptions.value = [];
    return;
  }
  
  const options = newQ.options.map((opt, idx) => ({ opt, originalIdx: idx }));
  
  // Fisher-Yates shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j]!, options[i]!];
  }
  
  shuffledOptions.value = options;
}, { immediate: true });

function handleAnswer(shuffledIndex: number) {
  if (props.disabled || !currentQuestion.value) return;
  
  // Map shuffled index back to original index
  const originalIdx = shuffledOptions.value[shuffledIndex]!.originalIdx;
  const isCorrect = originalIdx === currentQuestion.value.correctIndex;
  emit('answer', isCorrect);
}
</script>

<template>
  <div class="player-area" :class="{ disabled: disabled }" :style="{ '--player-color': color }">
    <div class="stats pixel-border">
      <h2>{{ player.name }}</h2>
      <!-- <div class="p-info">
        <span class="score">SCORE: {{ player.score }}</span>
        <span class="strength">POWER: {{ player.strength.toFixed(1) }}</span>
      </div>
      <div class="crew-list">
          <span v-for="(char, i) in player.crew" :key="i" class="crew-member">{{ char.emoji }}</span>
      </div> -->
    </div>

    <div class="question-board pixel-border" v-if="currentQuestion">
      <div class="question-text">{{ currentQuestion.text }}</div>
      <div class="options">
        <button 
          v-for="(item, idx) in shuffledOptions" 
          :key="idx" 
          @click="handleAnswer(idx)"
          class="option-btn"
        >
          {{ item.opt }}
        </button>
      </div>
    </div>
    <div v-else class="waiting">
      READY...
    </div>
  </div>
</template>

<style scoped>
.player-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
  border: 2px solid var(--player-color);
  background: rgba(0,0,0,0.5);
  transition: opacity 0.2s;
}

.player-area.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.stats {
  background: var(--player-color);
  color: white;
  padding: 0.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.p-info {
    display: flex;
    justify-content: space-around;
    font-weight: bold;
    font-size: 1.0rem;
}

.crew-list {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 2px;
    background: rgba(0,0,0,0.2);
    padding: 2px;
    border-radius: 4px;
}

.crew-member {
    font-size: 1.5rem;
    filter: drop-shadow(1px 1px 0px rgba(0,0,0,0.5));
}

.question-board {
  flex: 1;
  background: #333;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-text {
  font-size: 2rem;
  min-height: 3rem;
  text-align: center;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.option-btn {
  font-size: 2rem;
  border-color: var(--player-color);
  border-radius: 16px;
}

@media (max-height: 500px) {
  .player-area { padding: 0.25rem; gap: 0.25rem; }
  .question-text { font-size: 1.1rem; min-height: 1.5rem; margin-bottom: 0.25rem; }
  .option-btn { font-size: 1.1rem; padding: 0.25rem; border-radius: 8px; }
  .stats h2 { font-size: 1rem; margin: 0; padding: 0.25rem; }
  .question-board { padding: 0.5rem; gap: 0.5rem; }
  .options { gap: 0.5rem; }
}
</style>
