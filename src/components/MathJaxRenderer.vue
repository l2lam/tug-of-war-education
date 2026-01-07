<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue';

const props = defineProps<{
  content: string;
  inline?: boolean;
}>();

const container = ref<HTMLElement | null>(null);

async function renderMath() {
  if (!container.value) return;
  
  if (!(window as any).MathJax) {
    return;
  }

  try {
    await (window as any).MathJax.typesetPromise([container.value]);
  } catch (err) {
    console.error('MathJax rendering error:', err);
  }
}

onMounted(() => {
  renderMath();
});

watch(() => props.content, () => {
    nextTick(() => {
        renderMath();
    });
});
</script>

<template>
  <span 
    ref="container" 
    class="mathjax-content" 
    :style="{ display: inline ? 'inline' : 'block' }" 
    v-html="content"
  ></span>
</template>

<style scoped>
.mathjax-content {
    display: inherit;
}
</style>
