<script setup lang="ts">
import { computed } from 'vue';
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

function handleAnswer(index: number) {
  if (props.disabled || !currentQuestion.value) return;
  
  const isCorrect = index === currentQuestion.value.correctIndex;
  emit('answer', isCorrect);
}
</script>

<template>
  <div class="player-area" :class="{ disabled: disabled }" :style="{ '--player-color': color }">
    <div class="stats pixel-border">
      <h2>{{ player.name }}</h2>
      <div class="score">SCORE: {{ player.score }}</div>
      <div class="strength">POWER: {{ '⚡'.repeat(player.strength) }}</div>
    </div>

    <div class="question-board pixel-border" v-if="currentQuestion">
      <div class="question-text">{{ currentQuestion.text }}</div>
      <div class="options">
        <button 
          v-for="(opt, idx) in currentQuestion.options" 
          :key="idx" 
          @click="handleAnswer(idx)"
          class="option-btn"
        >
          {{ opt }}
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
  font-size: 1.2rem;
  min-height: 3rem;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.option-btn {
  font-size: 1rem;
  border-color: var(--player-color);
}
</style>
