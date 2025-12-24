<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/game';

const store = useGameStore();

// Offset is -100 to 100. 
// We want to map this to screen %. 
// Center is 50%. -100 is near 0%, 100 is near 100%.
const knotLeft = computed(() => {
  const range = 40; // Max movement percentage from center (Visual match with 10% zones)
  const normalized = store.ropeOffset; // -100 to 100
  // threshold is usually smaller than 100? Config says winningThreshold.
  // Let's use winningThreshold to normalize.
  const max = store.config.winningThreshold;
  const percent = (normalized / max) * range; // simple mapping
  return `calc(50% + ${percent}%)`;
});

const leftPullers = computed(() => Math.min(store.state.leftPlayer.strength, 10)); // Cap visuals
const rightPullers = computed(() => Math.min(store.state.rightPlayer.strength, 10));

</script>

<template>
  <div class="rope-container">
    <div class="ground-line"></div>
    <div class="win-zone left-zone"></div>
    <div class="win-zone right-zone"></div>
    
    <div class="rope-wrapper">
      <div class="rope-line"></div>
      <div class="knot" :style="{ left: knotLeft }"></div>
    </div>

    <div class="pullers left">
      <div v-for="n in leftPullers" :key="n" class="sprite p1">
        🏃
      </div>
    </div>

    <div class="pullers right">
      <div v-for="n in rightPullers" :key="n" class="sprite p2">
        🏃
      </div>
    </div>
  </div>
</template>

<style scoped>
.rope-container {
  position: relative;
  width: 100%;
  height: 200px;
  background: #222;
  border-top: 4px solid #000;
  border-bottom: 4px solid #000;
  overflow: hidden;
}

.ground-line {
  position: absolute;
  bottom: 20px;
  width: 100%;
  border-bottom: 2px dashed #555;
}

.win-zone {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 10%;
  background: rgba(255, 0, 0, 0.2);
  z-index: 0;
}
.left-zone { left: 0; border-right: 2px dashed red; }
.right-zone { right: 0; border-left: 2px dashed red; }

.rope-wrapper {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 10px;
  transform: translateY(-50%);
}

.rope-line {
  width: 100%;
  height: 8px;
  background: #cba;
  border: 1px solid #543;
}

.knot {
  position: absolute;
  top: 50%;
  width: 20px;
  height: 40px;
  background: red;
  transform: translate(-50%, -50%);
  border: 2px solid white;
}

.pullers {
  position: absolute;
  bottom: 30px;
  display: flex;
  gap: 5px;
  transition: all 0.2s;
}

.pullers.left {
  right: 55%; /* Start from center-ish and go left */
  flex-direction: row-reverse;
}

.pullers.right {
  left: 55%; /* Start from center-ish and go right */
  flex-direction: row;
}

.sprite {
  font-size: 2rem;
  filter: drop-shadow(2px 2px 0px black);
}
.p1 { transform: scaleX(-1); } /* Face right */
.p2 { transform: scaleX(1); } /* Face left */
/* Actually usually unicode runner runs right by default? */
/* 🏃 faces right. */
/* So left player (P1) should face Right (default). Right player (P2) should face Left (scaleX(-1)). */
/* Wait, P1 is on Left, pulling Left? No, pulling against each other. */
/* Tug of War:
   P1 (Left side) pulls towards Left <---
   P2 (Right side) pulls towards Right --->
   So P1 should face Left. P2 should face Right.
   Wait, they back away from the center.
   Center is KNOT.
   P1 is at Left of Knot, facing Center? No, facing Away.
   P1 pulls Left.
   P2 pulls Right.
*/
.p1 { transform: scaleX(-1); } /* Faces Left (if default is Right) */
.p2 { transform: scaleX(1); }  /* Faces Right */

</style>
