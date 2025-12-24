<script setup lang="ts">
import { ref } from 'vue';
import ServiceFactory from '../services';
import type { Question } from '../types';

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const topicName = ref('');
const questions = ref<Question[]>([]);
const newQText = ref('');
const newQOption1 = ref('');
const newQOption2 = ref('');
const newQOption3 = ref('');
const newQOption4 = ref('');
const correctIndex = ref(0);

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

function addQuestion() {
  if (!newQText.value) return;
  
  const q: Question = {
    id: generateId(),
    text: newQText.value,
    options: [newQOption1.value, newQOption2.value, newQOption3.value, newQOption4.value],
    correctIndex: correctIndex.value,
    topic: 'custom'
  };
  
  questions.value.push(q);
  // Reset fields
  newQText.value = '';
  newQOption1.value = '';
  newQOption2.value = '';
  newQOption3.value = '';
  newQOption4.value = '';
}

async function saveTopic() {
  if (!topicName.value || questions.value.length === 0) return;
  
  const dataService = ServiceFactory.getDataService();
  await dataService.saveTopic(topicName.value, questions.value);
  alert('Topic Saved!');
  emit('back');
}

function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const file = target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                // Validate structure briefly or just cast
                questions.value = parsed as Question[];
                alert(`Imported ${parsed.length} questions!`);
            } else {
                alert('Invalid format: structure must be an array of questions');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to parse JSON');
        }
    };
    reader.readAsText(file);
}
</script>

<template>
  <div class="level-editor">
    <div class="header">
      <button @click="emit('back')">BACK</button>
      <h1>TOPICS EDITOR</h1>
      <button @click="saveTopic" :disabled="!topicName || questions.length === 0">SAVE</button>
    </div>

    <div class="editor-body">
      <div class="level-meta">
        <label>TOPIC NAME:</label>
        <input v-model="topicName" placeholder="My Custom Topic" />
      </div>

      <div class="new-question-form pixel-border">
        <h3>NEW QUESTION</h3>
        <textarea v-model="newQText" placeholder="Question Text" rows="3"></textarea>
        
        <div class="options-grid">
           <div v-for="i in 4" :key="i" class="opt-input">
             <input :radio-value="i-1" type="radio" :value="i-1" v-model="correctIndex" name="correct" />
             <input v-if="i===1" v-model="newQOption1" placeholder="Option 1" />
             <input v-if="i===2" v-model="newQOption2" placeholder="Option 2" />
             <input v-if="i===3" v-model="newQOption3" placeholder="Option 3" />
             <input v-if="i===4" v-model="newQOption4" placeholder="Option 4" />
           </div>
        </div>

        <button @click="addQuestion">ADD QUESTION</button>
      </div>

      <div class="questions-list">
        <h3>QUESTIONS ({{ questions.length }})</h3>
        <div v-for="(q, idx) in questions" :key="q.id" class="q-item">
          <span class="badg">{{ idx + 1 }}</span>
          <span>{{ q.text }}</span>
        </div>
      </div>
      
      <div class="import-section">
         <label>Import JSON:</label>
         <input type="file" @change="handleFileUpload" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.topics-editor {
  background: #222;
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #000;
  border-bottom: 2px solid #555;
}

.editor-body {
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.level-meta {
  display: flex;
  gap: 1rem;
  font-size: 1.5rem;
  align-items: center;
}

.new-question-form {
  padding: 1rem;
  background: #333;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.opt-input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

textarea, input[type="text"], input[type="file"] {
  width: 100%;
  padding: 0.5rem;
  background: #111;
  color: white;
  border: 1px solid #555;
  font-family: inherit;
}

.q-item {
  background: #444;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  gap: 1rem;
}
</style>
