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
      <!-- <div class="score">SCORE: {{ player.score }}</div> -->
      <!-- <div class="strength">POWER: {{ '⚡'.repeat(player.strength) }}</div> -->
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
</style>
