import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { GameState, Question } from '../types';
import { PLAYER_ID, type PlayerId } from '../constants';
import ServiceFactory from '../services';

export const useGameStore = defineStore('game', () => {
    const p1NameKey = 'last_p1_name';
    const p2NameKey = 'last_p2_name';
    const state = ref<GameState>({
        isPlaying: false,
        isPaused: false,
        isTransitioning: false,
        ropePosition: 0,
        ropeVelocity: 0,
        round: 1,
        timeLeft: 0,
        leftPlayer: { id: PLAYER_ID.LEFT, name: 'Player 1', score: 0, strength: 1, topics: [], currentQuestion: undefined },
        rightPlayer: { id: PLAYER_ID.RIGHT, name: 'Player 2', score: 0, strength: 1, topics: [], currentQuestion: undefined },
        winner: null,
        p1Config: {
            name: localStorage.getItem(p1NameKey) || 'Player 1',
            topics: []
        },
        p2Config: {
            name: localStorage.getItem(p2NameKey) || 'Player 2',
            topics: []
        },
    });

    const config = ref({
        winningThreshold: 50,
        roundDuration: 30,
        mass: 5,
        friction: 0.95,
        pullForceMultiplier: parseFloat(localStorage.getItem('pullForceMultiplier') || '0.01'),
    });

    const ropeOffset = computed(() => state.value.ropePosition);

    async function saveConfigs() {
        const ds = ServiceFactory.getDataService();
        localStorage.setItem(p1NameKey, state.value.p1Config.name);
        localStorage.setItem(p2NameKey, state.value.p2Config.name);
        localStorage.setItem('pullForceMultiplier', config.value.pullForceMultiplier.toString());
        await Promise.all([
            ds.savePlayerConfig(state.value.p1Config),
            ds.savePlayerConfig(state.value.p2Config)
        ]);
    }

    async function loadConfigs() {
        const ds = ServiceFactory.getDataService();
        const [p1, p2, allTopics] = await Promise.all([
            ds.getPlayerConfig(state.value.p1Config.name),
            ds.getPlayerConfig(state.value.p2Config.name),
            ds.getAllTopics()
        ]);

        if (p1) state.value.p1Config = p1;
        if (p2) state.value.p2Config = p2;

        // Fallback for first-time use
        const fallback = allTopics[0];
        if (state.value.p1Config.topics.length === 0 && fallback) {
            state.value.p1Config.topics = [fallback.id];
        }
        if (state.value.p2Config.topics.length === 0 && fallback) {
            state.value.p2Config.topics = [fallback.id];
        }
    }

    function startGame() {
        saveConfigs(); // Fire and forget
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
                topics: state.value.p1Config.topics,
                currentQuestion: undefined
            },
            rightPlayer: {
                id: PLAYER_ID.RIGHT,
                name: state.value.p2Config.name,
                score: 0,
                strength: 3,
                topics: state.value.p2Config.topics,
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
        state.value.leftPlayer.currentQuestion = undefined;
        state.value.rightPlayer.currentQuestion = undefined;
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
        tick,
        answerQuestion,
        setQuestion,
        endGame,
        abortGame,
        saveConfigs,
        loadConfigs
    };
});
