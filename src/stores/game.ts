import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { GameState, PlayerConfig, Question } from '../types';
import { PLAYER_ID, type PlayerId } from '../constants';

export const useGameStore = defineStore('game', () => {
    const state = ref<GameState>({
        isPlaying: false,
        isPaused: false,
        isTransitioning: false,
        ropePosition: 0,
        round: 1,
        timeLeft: 0,
        leftPlayer: { id: PLAYER_ID.LEFT, name: 'Player 1', score: 0, strength: 1, difficulties: ['grade-1-math'], currentQuestion: undefined },
        rightPlayer: { id: PLAYER_ID.RIGHT, name: 'Player 2', score: 0, strength: 1, difficulties: ['grade-1-math'], currentQuestion: undefined },
        winner: null,
    });

    const config = ref({
        winningThreshold: 50,
        roundDuration: 30,
    });

    const ropeOffset = computed(() => state.value.ropePosition);

    function startGame(leftConfig: PlayerConfig, rightConfig: PlayerConfig) {
        state.value = {
            isPlaying: true,
            isPaused: false,
            isTransitioning: false,
            ropePosition: 0,
            round: 1,
            timeLeft: config.value.roundDuration,
            leftPlayer: {
                id: PLAYER_ID.LEFT,
                name: leftConfig.name,
                score: 0,
                strength: 1,
                difficulties: leftConfig.difficulties,
                currentQuestion: undefined
            },
            rightPlayer: {
                id: PLAYER_ID.RIGHT,
                name: rightConfig.name,
                score: 0,
                strength: 1,
                difficulties: rightConfig.difficulties,
                currentQuestion: undefined
            },
            winner: null,
        };
    }

    function updateRope(amount: number) {
        state.value.ropePosition += amount;
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
        if (isCorrect) {
            player.score += 10;
            player.strength += 1; // Increase pulling power
            // Pull rope towards player
            const pullAmount = playerId === PLAYER_ID.LEFT ? -player.strength : player.strength;
            updateRope(pullAmount);
        } else {
            player.strength = Math.max(1, player.strength - 1); // Decrease power but keep at least 1
            // Penalty: Rope slips slightly other way? Or just no pull.
            // Let's say they lose grip, so rope slides 1 unit towards opponent
            const slipAmount = playerId === PLAYER_ID.LEFT ? 2 : -2;
            updateRope(slipAmount);
        }
    }

    function setQuestion(playerId: PlayerId, question: Question) {
        if (playerId === PLAYER_ID.LEFT) {
            state.value.leftPlayer.currentQuestion = question;
        } else {
            state.value.rightPlayer.currentQuestion = question;
        }
    }

    return {
        state,
        config,
        ropeOffset,
        startGame,
        updateRope,
        answerQuestion,
        setQuestion,
        endGame
    };
});
