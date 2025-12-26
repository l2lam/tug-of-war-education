<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/game';

const store = useGameStore();

const ropeTranslate = computed(() => {
  const maxVW = 10; // Maximum movement in viewport width units (±10vw = reaching 40% or 60% from 50% center)
  const current = store.state.ropePosition; 
  const threshold = store.config.winningThreshold;
  const ratio = current / threshold; 
  return `${ratio * maxVW}vw`; // Use viewport width units, not percentage of assembly
});

</script>

<template>
  <div class="rope-viewport">
    
    <!-- Threshold Lines (Static) -->
    <div class="threshold left-threshold"></div>
    <div class="threshold right-threshold"></div>
    
    <!-- Moving Assembly (Rope + Pullers) -->
    <div class="rope-assembly" :style="{ transform: `translate(calc(-50% + ${ropeTranslate}), -50%)` }">
        <div class="rope-line"></div>
        
        <!-- Center Flag -->
        <div class="center-flag">🚩</div>

        <!-- Left Pullers (P1) -->
        <div class="puller-group left-group">
            <div v-for="(char, idx) in store.state.leftPlayer.crew" :key="idx" class="sprite p1-sprite">
                {{ char.emoji }}
            </div>
        </div>

        <!-- Right Pullers (P2) -->
        <div class="puller-group right-group">
            <div v-for="(char, idx) in store.state.rightPlayer.crew" :key="idx" class="sprite p2-sprite">
                {{ char.emoji }}
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.rope-viewport {
  position: relative;
  width: 100%;
  height: 250px;
  background: #333;
  border-top: 4px solid #111;
  border-bottom: 4px solid #111;
  overflow: hidden;
}

/* Threshold Indicators */
.threshold {
    position: absolute;
    top: 0; 
    bottom: 0;
    width: 4px;
    background: rgba(255, 200, 0, 0.6);
    border-left: 3px dashed #ff0;
    z-index: 100;
}
.left-threshold { left: 40%; }
.right-threshold { left: 60%; }

/* Assembly - this entire container moves left/right */
.rope-assembly {
    position: absolute;
    left: 50%; /* Start at exact center */
    top: 50%;
    transform: translate(-50%, -50%); /* Center the assembly itself, THEN apply the rope translate */
    width: 700px;
    height: 100px;
    will-change: transform;
}

.rope-line {
    position: absolute;
    left: 50px; /* Start after left pullers */
    right: 50px; /* End before right pullers */
    top: 50%;
    transform: translateY(-50%);
    height: 4px; /* Thinner rope */
    background: repeating-linear-gradient(
      90deg,
      #dcb 0,
      #dcb 8px,
      #cba 8px,
      #cba 16px
    );
    border: 1px solid #654;
    border-radius: 3px;
    z-index: 1;
}

.center-flag {
    font-size: 3rem;
    z-index: 3;
    position: absolute;
    left: 52%; /* Slightly right of center - flag portion extends right, so character center should be right */
    top: 60%;
    transform: translate(-50%, -70%);
    filter: drop-shadow(2px 2px 0px black);
    animation: wave 1s infinite alternate ease-in-out;
}

.puller-group {
    position: absolute;
    display: flex;
    gap: 1px;
    z-index: 2;
    top: 60%;
    transform: translateY(-50%); /* Center vertically on rope */
}

.left-group {
    left: 0; /* Far left */
    flex-direction: row;
}

.right-group {
    right: 0; /* Far right */
    flex-direction: row;
}

.sprite {
    font-size: 2.5rem;
    filter: drop-shadow(2px 2px 0px black);
    transform-origin: center;
}

.p1-sprite { 
    animation: pull-left 0.8s infinite alternate ease-in-out;
} 
.p2-sprite { 
    animation: pull-right 0.8s infinite alternate ease-in-out;
    animation-delay: 0.4s;
}

@keyframes wave {
    from { transform: translate(-50%, -70%) rotate(-10deg); }
    to { transform: translate(-50%, -70%) rotate(10deg); }
}

@keyframes pull-left {
    0% { transform: scaleX(-1) rotate(0deg); }
    100% { transform: scaleX(-1) rotate(20deg); } 
}

@keyframes pull-right {
    0% { transform: scaleX(1) rotate(0deg); }
    100% { transform: scaleX(1) rotate(-20deg); } 
}

@media (max-height: 500px) {
  .rope-viewport { height: 120px; }
  .rope-assembly { width: 500px; height: 60px; }
  .sprite { font-size: 1.5rem; }
  .center-flag { font-size: 2rem; }
  .rope-line { left: 20px; right: 20px; }
}
</style>
