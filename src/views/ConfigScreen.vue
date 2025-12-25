<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useGameStore } from '../stores/game';
import type { Topic } from '../types';
import ServiceFactory from '../services';
import { startBackgroundMusic, MUSIC_TRACK } from '../services/audio';

const store = useGameStore();

const emit = defineEmits<{
  (e: 'edit'): void;
}>();

const topics = ref<Topic[]>([]);

onMounted(async () => {
  // Resume menu music when returning to config
  const savedVolume = localStorage.getItem('musicVolume');
  const volume = savedVolume ? parseFloat(savedVolume) : 0.3;
  startBackgroundMusic(MUSIC_TRACK.MENU, volume);

  // Load saved topics for the current names
  await store.loadConfigs();

  topics.value = await ServiceFactory.getDataService().getAllTopics();
});

// Watch for name changes to load topics for known players
watch(() => store.state.p1Config.name, async (newName) => {
  const config = await ServiceFactory.getDataService().getPlayerConfig(newName);
  if (config) store.state.p1Config.topics = config.topics;
});

watch(() => store.state.p2Config.name, async (newName) => {
  const config = await ServiceFactory.getDataService().getPlayerConfig(newName);
  if (config) store.state.p2Config.topics = config.topics;
});

function toggleTopic(player: 'p1' | 'p2', topic: Topic) {
  const config = player === 'p1' ? store.state.p1Config : store.state.p2Config;
  const index = config.topics.indexOf(topic);
  
  if (index > -1) {
    if (config.topics.length > 1) {
      config.topics.splice(index, 1);
    }
  } else {
    config.topics.push(topic);
  }
}

function handleStart() {
  store.startGame();
}
</script>

<template>
  <div class="config-screen">
    <h1>TUG-OF-WAR SETUP</h1>
    
    <div class="players-setup">
      <div class="p-config p1-border">
        <h2>PLAYER 1 (LEFT)</h2>
        <div class="field">
          <label>NAME</label>
          <input v-model="store.state.p1Config.name" />
        </div>
        <div class="field">
          <label>TOPICS (Select at least one)</label>
          <div class="topic-list">
            <label v-for="t in topics" :key="t" class="topic-checkbox">
              <input 
                type="checkbox" 
                :checked="store.state.p1Config.topics.includes(t)"
                @change="toggleTopic('p1', t)"
              />
              <span>{{ t }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="vs">VS</div>

      <div class="p-config p2-border">
        <h2>PLAYER 2 (RIGHT)</h2>
        <div class="field">
          <label>NAME</label>
          <input v-model="store.state.p2Config.name" />
        </div>
        <div class="field">
          <label>TOPICS (Select at least one)</label>
          <div class="topic-list">
            <label v-for="t in topics" :key="t" class="topic-checkbox">
              <input 
                type="checkbox" 
                :checked="store.state.p2Config.topics.includes(t)"
                @change="toggleTopic('p2', t)"
              />
              <span>{{ t }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
        <button class="editor-btn" @click="emit('edit')">TOPICS EDITOR</button>
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
