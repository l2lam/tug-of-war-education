import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { GameState, Question } from '../types';
import { PLAYER_ID, type PlayerId } from '../constants';

export const useGameStore = defineStore('game', () => {
    const state = ref<GameState>({
        isPlaying: false,
        isPaused: false,
        isTransitioning: false,
        ropePosition: 0,
        ropeVelocity: 0,
        round: 1,
        timeLeft: 0,
        leftPlayer: { id: PLAYER_ID.LEFT, name: 'Player 1', score: 0, strength: 1, difficulties: ['grade-1-math'], currentQuestion: undefined },
        rightPlayer: { id: PLAYER_ID.RIGHT, name: 'Player 2', score: 0, strength: 1, difficulties: ['grade-1-math'], currentQuestion: undefined },
        winner: null,
        p1Config: { name: 'Player 1', difficulties: ['grade-1-math'] },
        p2Config: { name: 'Player 2', difficulties: ['grade-1-math'] },
    });

    const config = ref({
        winningThreshold: 50,
        roundDuration: 30,
        mass: 5,
        friction: 0.95,
        pullForceMultiplier: 0.01,
    });

    const ropeOffset = computed(() => state.value.ropePosition);

    function startGame() {
        state.value = {
            ...state.value,
            isPlaying: true,
            isPaused: false,
            isTransitioning: false,
            ropePosition: 0,
            ropeVelocity: 0,
            round: 1,
            timeLeft: config.value.roundDuration,
            leftPlayer: {
                id: PLAYER_ID.LEFT,
                name: state.value.p1Config.name,
                score: 0,
                strength: 3,
                difficulties: state.value.p1Config.difficulties,
                currentQuestion: undefined
            },
            rightPlayer: {
                id: PLAYER_ID.RIGHT,
                name: state.value.p2Config.name,
                score: 0,
                strength: 3,
                difficulties: state.value.p2Config.difficulties,
                currentQuestion: undefined
            },
            winner: null,
        };
    }

    function tick() {
        if (!state.value.isPlaying || state.value.isPaused) return;

        // Physics Loop
        const leftForce = state.value.leftPlayer.strength * config.value.pullForceMultiplier;
        const rightForce = state.value.rightPlayer.strength * config.value.pullForceMultiplier;

        // Net force (Right is positive, Left is negative)
        const netForce = rightForce - leftForce;

        // F = ma -> a = F/m
        const acceleration = netForce / config.value.mass;

        // v = v + a
        state.value.ropeVelocity += acceleration;

        // Friction / Damping
        state.value.ropeVelocity *= config.value.friction;

        // p = p + v
        state.value.ropePosition += state.value.ropeVelocity;

        checkWinCondition();
    }

    function checkWinCondition() {
        if (state.value.ropePosition <= -config.value.winningThreshold) {
            endGame(PLAYER_ID.LEFT);
        } else if (state.value.ropePosition >= config.value.winningThreshold) {
            endGame(PLAYER_ID.RIGHT);
        }
    }

    function endGame(winner: PlayerId) {
        state.value.isPlaying = false;
        state.value.winner = winner;
    }

    function answerQuestion(playerId: PlayerId, isCorrect: boolean) {
        const player = playerId === PLAYER_ID.LEFT ? state.value.leftPlayer : state.value.rightPlayer;
        const opponent = playerId === PLAYER_ID.LEFT ? state.value.rightPlayer : state.value.leftPlayer;

        if (isCorrect) {
            player.score += 10;

            // If player strength is already > 5, penalize opponent instead of gaining more strength
            if (player.strength > 5) {
                opponent.strength = Math.max(1, opponent.strength - 1);
            } else {
                player.strength += 1; // Increase constant pulling power
            }
        } else {
            player.strength = Math.max(1, player.strength - 1); // Decrease power
        }
    }

    function setQuestion(playerId: PlayerId, question: Question) {
        if (playerId === PLAYER_ID.LEFT) {
            state.value.leftPlayer.currentQuestion = question;
        } else {
            state.value.rightPlayer.currentQuestion = question;
        }
    }

    function abortGame() {
        state.value.isPlaying = false;
        state.value.winner = null;
    }

    return {
        state,
        config,
        ropeOffset,
        startGame,
        updateRope: () => { /* no-op */ }, // Kept for compatibility if external components call it
        tick,
        answerQuestion,
        setQuestion,
        endGame,
        abortGame
    };
});
