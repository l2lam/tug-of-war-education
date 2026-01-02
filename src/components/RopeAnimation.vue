<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../stores/game';
import { COMMENTARY, COMMENTARY_TYPE, type CommentaryType } from '../data/commentary';

const store = useGameStore();

const ropeTranslate = computed(() => {
  const maxVW = 20; // Increased from 10 to match new threshold lines at 30%/70% (±20% from center)
  const current = store.state.ropePosition; 
  const threshold = store.config.winningThreshold;
  const ratio = current / threshold; 
  return `${ratio * maxVW}vw`; // Use viewport width units, not percentage of assembly
});

const tension = computed(() => {
    const leftStrength = store.state.leftPlayer.crew.reduce((sum, c) => sum + c.character.strength, 0);
    const rightStrength = store.state.rightPlayer.crew.reduce((sum, c) => sum + c.character.strength, 0);
    return leftStrength + rightStrength;
});

// Commentary System
const commentaries = ref<Record<string, string>>({});
let commentaryInterval: number | null = null;

const getPlayerState = (isLeft: boolean): CommentaryType => {
    const current = store.state.ropePosition;
    const threshold = store.config.winningThreshold;
    const ratio = current / threshold; // -1 to 1 (approx)
    const winner = store.state.winner;
    
    // Check for game-over states
    if (winner) {
        if (isLeft) {
            return winner === 'left' ? COMMENTARY_TYPE.WON : COMMENTARY_TYPE.LOST;
        } else {
            return winner === 'right' ? COMMENTARY_TYPE.WON : COMMENTARY_TYPE.LOST;
        }
    }
    
    // Determine momentum based on strength comparison
    const leftStrength = store.state.leftPlayer.strength;
    const rightStrength = store.state.rightPlayer.strength;
    const playerStrength = isLeft ? leftStrength : rightStrength;
    const opponentStrength = isLeft ? rightStrength : leftStrength;
    
    const hasStrengthAdvantage = playerStrength > opponentStrength;
    const hasStrengthDisadvantage = playerStrength < opponentStrength;
    
    // Tie condition
    if (Math.abs(ratio) < 0.15) return COMMENTARY_TYPE.TIE;

    if (isLeft) {
        // Left wins if rope moves Left (negative ratio)
        if (ratio < -0.7) return COMMENTARY_TYPE.IMMINENT_VICTORY;
        if (ratio < -0.15) {
            // Winning position but weaker strength = losing momentum
            if (hasStrengthDisadvantage) {
                return COMMENTARY_TYPE.WINNING_LOSING_MOMENTUM;
            }
            return COMMENTARY_TYPE.WINNING;
        }
        if (ratio > 0.7) return COMMENTARY_TYPE.IMMINENT_DEFEAT;
        if (ratio > 0.15) {
            // Losing position but stronger strength = gaining momentum
            if (hasStrengthAdvantage) {
                return COMMENTARY_TYPE.LOSING_GAINING_MOMENTUM;
            }
            return COMMENTARY_TYPE.LOSING;
        }
    } else {
        // Right wins if rope moves Right (positive ratio)
        if (ratio > 0.7) return COMMENTARY_TYPE.IMMINENT_VICTORY;
        if (ratio > 0.15) {
            // Winning position but weaker strength = losing momentum
            if (hasStrengthDisadvantage) {
                return COMMENTARY_TYPE.WINNING_LOSING_MOMENTUM;
            }
            return COMMENTARY_TYPE.WINNING;
        }
        if (ratio < -0.7) return COMMENTARY_TYPE.IMMINENT_DEFEAT;
        if (ratio < -0.15) {
            // Losing position but stronger strength = gaining momentum
            if (hasStrengthAdvantage) {
                return COMMENTARY_TYPE.LOSING_GAINING_MOMENTUM;
            }
            return COMMENTARY_TYPE.LOSING;
        }
    }
    return COMMENTARY_TYPE.TIE;
};

const triggerCommentary = () => {
    const isLeft = Math.random() > 0.5;
    const crew = isLeft ? store.state.leftPlayer.crew : store.state.rightPlayer.crew;

    if (crew.length === 0) return;

    const member = crew[Math.floor(Math.random() * crew.length)];
    if (!member) return;
    
    const state = getPlayerState(isLeft);
    const phrases = COMMENTARY[state];
    const text = phrases[Math.floor(Math.random() * phrases.length)];

    if (text) {
        commentaries.value[member.instanceId] = text;

        setTimeout(() => {
            delete commentaries.value[member.instanceId];
        }, 2500 + Math.random() * 1000); // 2.5 - 3.5s duration
    }
};

// Recoil Effect
const isRecoilLeft = ref(false);
const isRecoilRight = ref(false);

watch(() => store.state.lastOutcome, (outcome) => {
    if (!outcome) return;
    
    if (outcome.playerId === 'left') {
        isRecoilLeft.value = true;
        setTimeout(() => isRecoilLeft.value = false, 500);
    } else {
        isRecoilRight.value = true;
        setTimeout(() => isRecoilRight.value = false, 500);
    }
});

onMounted(() => {
    commentaryInterval = window.setInterval(triggerCommentary, 3000);
});

onUnmounted(() => {
    if (commentaryInterval) clearInterval(commentaryInterval);
});
</script>

<template>
  <div class="rope-viewport">
    
    <!-- Threshold Lines (Static) -->
    <div class="threshold left-threshold"></div>
    <div class="threshold right-threshold"></div>
    
    <!-- Moving Assembly (Rope + Pullers) -->
    <div class="rope-assembly" :class="{ 'jitter': tension > 10, 'recoil-left': isRecoilLeft, 'recoil-right': isRecoilRight }" :style="{ transform: `translate(calc(-50% + ${ropeTranslate}), -50%)`, '--tension-scale': Math.min(tension / 20, 1), '--rope-pos': ropeTranslate }">
        <div class="rope-line"></div>
        
        <!-- Center Flag -->
        <div class="center-flag">🚩</div>

        <!-- Left Pullers (P1) -->
        <TransitionGroup name="pop" tag="div" class="puller-group left-group">
            <div v-for="member in store.state.leftPlayer.crew" :key="member.instanceId" class="sprite-wrapper">
                <Transition name="fade">
                    <div v-if="commentaries[member.instanceId]" class="commentary-bubble">
                        {{ commentaries[member.instanceId] }}
                    </div>
                </Transition>
                <div class="sprite p1-sprite">
                    {{ member.character.emoji }}
                </div>
            </div>
        </TransitionGroup>

        <!-- Right Pullers (P2) -->
        <TransitionGroup name="pop" tag="div" class="puller-group right-group">
            <div v-for="member in store.state.rightPlayer.crew" :key="member.instanceId" class="sprite-wrapper">
                <Transition name="fade">
                    <div v-if="commentaries[member.instanceId]" class="commentary-bubble">
                        {{ commentaries[member.instanceId] }}
                    </div>
                </Transition>
                <div class="sprite p2-sprite">
                    {{ member.character.emoji }}
                </div>
            </div>
        </TransitionGroup>
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
    z-index: 0;
}
.left-threshold { left: 30%; }
.right-threshold { left: 70%; }

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
    z-index: 2;
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
    z-index: 3;
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

.sprite-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
}

.commentary-bubble {
    position: absolute;
    bottom: 110%;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    color: black;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 1.2rem;
    font-weight: bold;
    white-space: nowrap;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    pointer-events: none;
    border: 1px solid #ccc;
}

.commentary-bubble::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: white transparent transparent transparent;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes wave {
    from { transform: translate(-50%, -70%) rotate(-10deg); }
    to { transform: translate(-50%, -70%) rotate(10deg); }
}

.jitter {
    animation: jitter-frames 0.2s infinite ease-in-out;
}

@keyframes jitter-frames {
    0% { margin-top: 0; margin-left: 0; }
    25% { margin-top: calc(var(--tension-scale) * -1px); margin-left: calc(var(--tension-scale) * 1px); }
    50% { margin-top: calc(var(--tension-scale) * 1px); margin-left: calc(var(--tension-scale) * -1px); }
    75% { margin-top: calc(var(--tension-scale) * -1px); margin-left: calc(var(--tension-scale) * -1px); }
    100% { margin-top: 0; margin-left: 0; }
}

@keyframes pull-left {
    0% { transform: scaleX(-1) rotate(0deg); }
    100% { transform: scaleX(-1) rotate(20deg); } 
}

@keyframes pull-right {
    0% { transform: scaleX(1) rotate(0deg); }
    100% { transform: scaleX(1) rotate(-20deg); } 
}

/* Animations */
.pop-enter-active,
.pop-leave-active {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.pop-enter-from {
  opacity: 0;
  transform: scale(0) translateY(-50px);
}

.pop-leave-to {
  opacity: 0;
  transform: scale(0) translateY(50px);
}

.recoil-left {
    animation: recoil-frames-left 0.5s ease-out;
}

.recoil-right {
    animation: recoil-frames-right 0.5s ease-out;
}

@keyframes recoil-frames-left {
    0% { transform: translate(calc(-50% + var(--rope-pos, 0vw)), -50%) scale(1.05); }
    20% { transform: translate(calc(-50% + var(--rope-pos, 0vw) - 20px), -50%) scale(1.1); }
    100% { transform: translate(calc(-50% + var(--rope-pos, 0vw)), -50%) scale(1); }
}

@keyframes recoil-frames-right {
    0% { transform: translate(calc(-50% + var(--rope-pos, 0vw)), -50%) scale(1.05); }
    20% { transform: translate(calc(-50% + var(--rope-pos, 0vw) + 20px), -50%) scale(1.1); }
    100% { transform: translate(calc(-50% + var(--rope-pos, 0vw)), -50%) scale(1); }
}

@media (max-height: 500px) {
  .rope-viewport { height: 120px; }
  .rope-assembly { width: 500px; height: 60px; }
  .sprite { font-size: 1.5rem; }
  .center-flag { font-size: 2rem; }
  .rope-line { left: 20px; right: 20px; }
}
</style>
