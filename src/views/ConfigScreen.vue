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
const p1Topics = ref<Difficulty[]>(['grade-1-math']); // Multi-select
const p2Name = ref('Player 2');
const p2Topics = ref<Difficulty[]>(['grade-1-math']); // Multi-select

function toggleTopic(player: 'p1' | 'p2', topic: Difficulty) {
  const topics = player === 'p1' ? p1Topics : p2Topics;
  const index = topics.value.indexOf(topic);
  
  if (index > -1) {
    // Only allow deselect if more than 1 topic selected
    if (topics.value.length > 1) {
      topics.value.splice(index, 1);
    }
  } else {
    topics.value.push(topic);
  }
}

function handleStart() {
  store.startGame(
    { name: p1Name.value, difficulties: p1Topics.value },
    { name: p2Name.value, difficulties: p2Topics.value }
  );
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
          <label>TOPICS (Select at least one)</label>
          <div class="topic-list">
            <label v-for="d in difficulties" :key="d" class="topic-checkbox">
              <input 
                type="checkbox" 
                :checked="p1Topics.includes(d)"
                @change="toggleTopic('p1', d)"
              />
              <span>{{ d }}</span>
            </label>
          </div>
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
          <label>TOPICS (Select at least one)</label>
          <div class="topic-list">
            <label v-for="d in difficulties" :key="d" class="topic-checkbox">
              <input 
                type="checkbox" 
                :checked="p2Topics.includes(d)"
                @change="toggleTopic('p2', d)"
              />
              <span>{{ d }}</span>
            </label>
          </div>
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

.topic-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  background: #000;
  border: 2px solid #555;
}

.topic-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: background 0.2s;
}

.topic-checkbox:hover {
  background: #333;
}

.topic-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.topic-checkbox span {
  font-size: 1rem;
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
