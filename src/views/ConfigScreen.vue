<script setup lang="ts">
import { ref } from 'vue';
import { useGameStore } from '../stores/game';
import type { Difficulty } from '../types';

import ServiceFactory from '../services';

const store = useGameStore();

const emit = defineEmits<{
  (e: 'edit'): void;
}>();

const difficulties = ref<Difficulty[]>(['grade-1-math', 'grade-12-math', 'grade-9-science']);

import { onMounted } from 'vue';
onMounted(async () => {
  const custom = await ServiceFactory.getDataService().getCustomLevels();
  difficulties.value = [...difficulties.value, ...custom];
});

const p1Name = ref('Player 1');
const p1Diff = ref<Difficulty>('grade-1-math');
const p2Name = ref('Player 2');
const p2Diff = ref<Difficulty>('grade-1-math');

function handleStart() {
  store.startGame(
    { name: p1Name.value, difficulties: [p1Diff.value] },
    { name: p2Name.value, difficulties: [p2Diff.value] }
  );
  // Game assumes external trigger for loop usually, but store tracks playing state.
  // The loop needs to be started.
  // We should probably start the loop here or in GameScreen on mount if playing.
}
</script>

<template>
  <div class="config-screen">
    <h1>BATTLE SETUP</h1>
    
    <div class="players-setup">
      <div class="p-config p1-border">
        <h2>PLAYER 1 (LEFT)</h2>
        <div class="field">
          <label>NAME</label>
          <input v-model="p1Name" />
        </div>
        <div class="field">
          <label>DIFFICULTY</label>
          <select v-model="p1Diff">
            <option v-for="d in difficulties" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
      </div>

      <div class="vs">VS</div>

      <div class="p-config p2-border">
        <h2>PLAYER 2 (RIGHT)</h2>
        <div class="field">
          <label>NAME</label>
          <input v-model="p2Name" />
        </div>
        <div class="field">
          <label>DIFFICULTY</label>
          <select v-model="p2Diff">
            <option v-for="d in difficulties" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="actions">
        <button class="editor-btn" @click="emit('edit')">LEVEL EDITOR</button>
        <button class="start-btn" @click="handleStart">FIGHT!</button>
    </div>
  </div>
</template>

<style scoped>
.config-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  background: black;
  color: white;
}

.players-setup {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.p-config {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  border: 4px solid white;
  background: #222;
}

.p1-border { border-color: var(--p1-color); }
.p2-border { border-color: var(--p2-color); }

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

input, select {
  font-family: inherit;
  font-size: 1.2rem;
  padding: 0.5rem;
  background: #000;
  color: white;
  border: 2px solid #555;
}

.vs {
  font-size: 3rem;
  font-weight: bold;
  color: yellow;
}

.actions {
  display: flex;
  gap: 2rem;
}

.start-btn {
  font-size: 2rem;
  padding: 1rem 3rem;
  animation: pulse 1s infinite;
}

.editor-btn {
  font-size: 1rem;
  background: #333;
  border-color: #555;
  color: #ccc;
  align-self: center;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>
