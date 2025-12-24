<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGameStore } from './stores/game';
import GameScreen from './views/GameScreen.vue';
import ConfigScreen from './views/ConfigScreen.vue';
import LevelEditor from './views/LevelEditor.vue';
import { onMounted } from 'vue';
import { startBackgroundMusic, MUSIC_TRACK } from './services/audio';

const store = useGameStore();

type View = 'config' | 'game' | 'editor';
const currentView = ref<View>('config');

// If store isPlaying, force game view?
// Actually ConfigScreen starts the game.
// So when startGame is called, we should switch to game.
// But store.startGame returns void. We can watch store.isPlaying.
watch(() => store.state.isPlaying, (playing) => {
  if (playing) {
    currentView.value = 'game';
  } else if (currentView.value === 'game' && !store.state.winner) {
    // Game stopped without winner (e.g., user manually stopped)
    currentView.value = 'config';
  }
  // If there's a winner, stay on game screen to show victory overlay
});

onMounted(() => {
  // Start menu music on initial load
  startBackgroundMusic(MUSIC_TRACK.MENU);
});

function handleNavigate(view: View) {
  currentView.value = view;
}
</script>

<template>
  <GameScreen v-if="currentView === 'game'" />
  <ConfigScreen 
    v-else-if="currentView === 'config'" 
    @edit="handleNavigate('editor')" 
  />
  <LevelEditor 
    v-else-if="currentView === 'editor'" 
    @back="handleNavigate('config')" 
  />
</template>

<style scoped>
</style>
