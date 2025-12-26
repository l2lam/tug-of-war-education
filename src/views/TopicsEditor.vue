<script setup lang="ts">
import { ref } from 'vue';
import ServiceFactory from '../services';
import type { Question, Topic, VariableDefinition, QuestionTemplate } from '../types';

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const topicName = ref('');
const topicDescription = ref('');
const questions = ref<Question[]>([]);
const newQText = ref('');
const newQOption1 = ref('');
const newQOption2 = ref('');
const newQOption3 = ref('');
const newQOption4 = ref('');
const correctIndex = ref(0);

// Variable Management
const currentVariables = ref<Record<string, VariableDefinition>>({});
const newVarName = ref('');
const newVarMin = ref(1);
const newVarMax = ref(10);

function addVariable() {
    const name = newVarName.value.trim();
    if (!name || newVarMin.value >= newVarMax.value) {
        alert('Invalid variable: Check name and min/max range');
        return;
    }
    currentVariables.value[name] = {
        min: newVarMin.value,
        max: newVarMax.value
    };
    newVarName.value = '';
    newVarMin.value = 1;
    newVarMax.value = 10;
}

function removeVariable(name: string) {
    delete currentVariables.value[name];
}

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

function addQuestion() {
  if (!newQText.value) return;
  
  // Note: topicId will be assigned during saveTopic
  const q: QuestionTemplate = {
    id: generateId(),
    text: newQText.value,
    options: [newQOption1.value, newQOption2.value, newQOption3.value, newQOption4.value],
    correctIndex: correctIndex.value,
    topicId: '', // placeholder
    variables: Object.keys(currentVariables.value).length > 0 ? { ...currentVariables.value } : undefined
  };
  
  questions.value.push(q);
  // Reset fields
  newQText.value = '';
  newQOption1.value = '';
  newQOption2.value = '';
  newQOption3.value = '';
  newQOption4.value = '';
  currentVariables.value = {};
}

async function saveTopic() {
  if (!topicName.value || questions.value.length === 0) return;
  
  const topicId = topicName.value.toLowerCase().replace(/\s+/g, '-');
  const topic: Topic = {
    id: topicId,
    name: topicName.value,
    description: topicDescription.value
  };

  const dataService = ServiceFactory.getDataService();
  await dataService.saveTopic(topic, questions.value);
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
                // Legacy flat array
                questions.value = parsed.map(q => ({ ...q, topicId: '' })) as Question[];
                alert(`Imported ${parsed.length} questions!`);
            } else if (parsed && typeof parsed === 'object') {
                // Hierarchical format
                topicName.value = parsed.name || topicName.value;
                topicDescription.value = parsed.description || topicDescription.value;
                questions.value = (parsed.questions || []).map((q: any) => ({ ...q, topicId: parsed.id || '' })) as Question[];
                alert(`Imported ${questions.value.length} questions from ${topicName.value}!`);
            } else {
                alert('Invalid format: structure must be an array or a topic object');
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
  <div class="topics-editor">
    <div class="header">
      <button @click="emit('back')">BACK</button>
      <h1>TOPICS EDITOR</h1>
      <button @click="saveTopic" :disabled="!topicName || questions.length === 0">SAVE</button>
    </div>

    <div class="editor-body">
      <div class="level-meta">
        <div class="field">
            <label>TOPIC NAME:</label>
            <input v-model="topicName" placeholder="My Custom Topic" />
        </div>
        <div class="field">
            <label>DESCRIPTION:</label>
            <input v-model="topicDescription" placeholder="Optional description..." />
        </div>
      </div>

      <div class="new-question-form pixel-border">
        <h3>NEW QUESTION</h3>
        <textarea v-model="newQText" placeholder="Question Text (use {{VAR}} for variables)" rows="3"></textarea>
        
        <!-- Variables Section -->
        <div class="variables-section">
            <h4>Variables (Optional)</h4>
            <div class="var-inputs">
                <input v-model="newVarName" placeholder="Name (e.g. X)" style="width: 100px;" />
                <input v-model.number="newVarMin" type="number" placeholder="Min" style="width: 60px;" />
                <input v-model.number="newVarMax" type="number" placeholder="Max" style="width: 60px;" />
                <button @click="addVariable" class="small-btn">+</button>
            </div>
            <div class="var-list">
                <span v-for="(def, name) in currentVariables" :key="name" class="var-tag">
                    {{ name }}: [{{ def.min }}-{{ def.max }}]
                    <b @click="removeVariable(name as string)" class="remove-x">x</b>
                </span>
            </div>
        </div>

        <div class="options-grid">
           <div v-for="i in 4" :key="i" class="opt-input">
             <input :radio-value="i-1" type="radio" :value="i-1" v-model="correctIndex" name="correct" />
             <input v-if="i===1" v-model="newQOption1" placeholder="Option 1 (e.g. {{X + Y}})" />
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
          <span class="badge">{{ idx + 1 }}</span>
          <span>{{ q.text }}</span>
        </div>
      </div>
      
      <div class="import-section">
         <label>Import JSON (Flat or Hierarchical):</label>
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

.variables-section {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #2a2a2a;
  border: 1px dashed #555;
}

.var-inputs {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.small-btn {
  padding: 0 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.var-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.var-tag {
  background: #555;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-x {
  color: #ff6b6b;
  cursor: pointer;
  font-weight: bold;
}

.remove-x:hover {
  color: #ff0000;
}
</style>
