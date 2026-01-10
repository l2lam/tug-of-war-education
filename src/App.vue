<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGameStore } from './stores/game';
import GameScreen from './views/GameScreen.vue';
import ConfigScreen from './views/ConfigScreen.vue';
import TopicsEditor from './views/TopicsEditor.vue';
import AboutScreen from './views/AboutScreen.vue';
import { onMounted } from 'vue';
import { startBackgroundMusic, MUSIC_TRACK } from './services/audio';
import { SCREEN_ID, type ScreenId } from './constants';

const store = useGameStore();

const currentScreen = ref<ScreenId>(SCREEN_ID.CONFIG);
const editingTopicId = ref<string | undefined>(undefined);
const isCloneMode = ref(false);

// If store isPlaying, force game view?
// Actually ConfigScreen starts the game.
// So when startGame is called, we should switch to game.
// But store.startGame returns void. We can watch store.isPlaying.
watch(() => store.state.isPlaying, (playing) => {
  if (playing) {
    currentScreen.value = SCREEN_ID.GAME;
  } else if (currentScreen.value === SCREEN_ID.GAME && !store.state.winner) {
    // Game stopped without winner (e.g., user manually stopped)
    currentScreen.value = SCREEN_ID.CONFIG;
  }
  // If there's a winner, stay on game screen to show victory overlay
});

function handleEditTopic(topicId?: string, isClone = false) {
  editingTopicId.value = topicId;
  isCloneMode.value = isClone;
  currentScreen.value = SCREEN_ID.TOPICS_EDITOR;
}

function handleBackFromEditor() {
  editingTopicId.value = undefined;
  isCloneMode.value = false;
  currentScreen.value = SCREEN_ID.CONFIG;
}

function handleAbout() {
  currentScreen.value = SCREEN_ID.ABOUT;
}

function handleBackFromAbout() {
  currentScreen.value = SCREEN_ID.CONFIG;
}

onMounted(() => {
  // Start menu music on initial load
  startBackgroundMusic(MUSIC_TRACK.MENU);
});

</script>

<template>
  <TopicsEditor
    v-if="currentScreen === SCREEN_ID.TOPICS_EDITOR"
    :topicId="editingTopicId"
    :isClone="isCloneMode"
    @back="handleBackFromEditor"
  />
  <GameScreen v-if="currentScreen === SCREEN_ID.GAME" />
  <ConfigScreen 
    v-if="currentScreen === SCREEN_ID.CONFIG" 
    @edit="handleEditTopic"
    @about="handleAbout"
  />
  <AboutScreen 
    v-if="currentScreen === SCREEN_ID.ABOUT"
    @back="handleBackFromAbout"
  />
</template>

<style scoped>
</style>
