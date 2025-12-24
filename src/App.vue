<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGameStore } from './stores/game';
import GameScreen from './views/GameScreen.vue';
import ConfigScreen from './views/ConfigScreen.vue';
import TopicsEditor from './views/TopicsEditor.vue';
import { onMounted } from 'vue';
import { startBackgroundMusic, MUSIC_TRACK } from './services/audio';

const store = useGameStore();

const currentScreen = ref<'config' | 'game' | 'topics-editor'>('config');

// If store isPlaying, force game view?
// Actually ConfigScreen starts the game.
// So when startGame is called, we should switch to game.
// But store.startGame returns void. We can watch store.isPlaying.
watch(() => store.state.isPlaying, (playing) => {
  if (playing) {
    currentScreen.value = 'game';
  } else if (currentScreen.value === 'game' && !store.state.winner) {
    // Game stopped without winner (e.g., user manually stopped)
    currentScreen.value = 'config';
  }
  // If there's a winner, stay on game screen to show victory overlay
});

onMounted(() => {
  // Start menu music on initial load
  startBackgroundMusic(MUSIC_TRACK.MENU);
});

</script>

<template>
  <TopicsEditor
    v-if="currentScreen === 'topics-editor'"
    @back="currentScreen = 'config'"
  />
  <GameScreen v-if="currentScreen === 'game'" />
  <ConfigScreen v-if="currentScreen === 'config'" @edit="currentScreen = 'topics-editor'" />
</template>

<style scoped>
</style>
