import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { GameState, Question, PowerSprite } from '../types';
import { PLAYER_ID, type PlayerId, CHARACTERS, SOUND_TYPE, STORAGE_KEYS, POWER_SPRITES_DATA, POWER_TYPE, POWER_CONFIG, SPRITE_KEYS } from '../constants';
import ServiceFactory from '../services';
import { playSound } from '../services/audio';

import type { Character } from '../types';

const ANT = CHARACTERS[0];

function createCrewMember(character: Character) {
    return {
        instanceId: Math.random().toString(36).substr(2, 9),
        character: { ...character }
    };
}

export const useGameStore = defineStore('game', () => {
    const state = ref<GameState>({
        isPlaying: false,
        isPaused: false,
        isTransitioning: false,
        ropePosition: 0,
        ropeVelocity: 0,
        round: 1,
        timeLeft: 0,
        leftPlayer: { id: PLAYER_ID.LEFT, name: 'Player 1', score: 0, strength: 3, topics: [], currentQuestion: undefined, crew: [createCrewMember(ANT), createCrewMember(ANT), createCrewMember(ANT)] },
        rightPlayer: { id: PLAYER_ID.RIGHT, name: 'Player 2', score: 0, strength: 3, topics: [], currentQuestion: undefined, crew: [createCrewMember(ANT), createCrewMember(ANT), createCrewMember(ANT)] },
        winner: null,
        p1Config: {
            name: localStorage.getItem(STORAGE_KEYS.P1_NAME) || 'Player 1',
            topics: []
        },
        p2Config: {
            name: localStorage.getItem(STORAGE_KEYS.P2_NAME) || 'Player 2',
            topics: []
        },
        activeSprites: [],
        activePower: null,
    });

    const config = ref({
        winningThreshold: 50,
        roundDuration: 30,
        mass: 5,
        friction: 0.95,
        pullForceMultiplier: parseFloat(localStorage.getItem(STORAGE_KEYS.PULL_FORCE_MULTIPLIER) || '0.005'),
    });

    const ropeOffset = computed(() => state.value.ropePosition);

    async function saveConfigs() {
        const ds = ServiceFactory.getDataService();
        localStorage.setItem(STORAGE_KEYS.P1_NAME, state.value.p1Config.name);
        localStorage.setItem(STORAGE_KEYS.P2_NAME, state.value.p2Config.name);
        localStorage.setItem(STORAGE_KEYS.PULL_FORCE_MULTIPLIER, config.value.pullForceMultiplier.toString());
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
                currentQuestion: undefined,
                crew: [createCrewMember(ANT), createCrewMember(ANT), createCrewMember(ANT)]
            },
            rightPlayer: {
                id: PLAYER_ID.RIGHT,
                name: state.value.p2Config.name,
                score: 0,
                strength: 3,
                topics: state.value.p2Config.topics,
                currentQuestion: undefined,
                crew: [createCrewMember(ANT), createCrewMember(ANT), createCrewMember(ANT)]
            },
            winner: null,
        };
    }

    function tick() {
        if (!state.value.isPlaying) return;

        // Sprite & Power Logic (Runs even if physics is paused)
        if (!state.value.activePower) {
            // Spawn Sprites
            if (state.value.activeSprites.length < 2 && Math.random() < POWER_CONFIG.SPAWN_CHANCE) {
                spawnPowerSprite();
            }

            // Update Sprites
            const now = Date.now();
            for (let i = state.value.activeSprites.length - 1; i >= 0; i--) {
                const s = state.value.activeSprites[i];
                if (!s) continue; // Safety check

                // Expiration
                if (now - s.createdAt > POWER_CONFIG.DURATION) {
                    state.value.activeSprites.splice(i, 1);
                    continue;
                }

                // Movement
                s.x += s.vx + (Math.random() - 0.5) * 0.5;
                s.y += s.vy + (Math.random() - 0.5) * 0.5;

                // Bounds
                if (s.playerId === PLAYER_ID.LEFT) {
                    if (s.x < 0) { s.x = 0; s.vx *= -1; }
                    if (s.x > 35) { s.x = 35; s.vx *= -1; }
                } else {
                    if (s.x < 65) { s.x = 65; s.vx *= -1; }
                    if (s.x > 100) { s.x = 100; s.vx *= -1; }
                }

                if (s.y < 0) { s.y = 0; s.vy *= -1; }
                if (s.y > 100) { s.y = 100; s.vy *= -1; }
            }
        } else {
            // Check active power expiration
            if (Date.now() > state.value.activePower.endTime) {
                endPowerPhase();
            }
        }

        if (state.value.isPaused) return;

        // Physics Loop
        // Physics Loop - Strength is sum of crew
        const leftStrength = state.value.leftPlayer.crew.reduce((sum, c) => sum + c.character.strength, 0);
        const rightStrength = state.value.rightPlayer.crew.reduce((sum, c) => sum + c.character.strength, 0);

        // Sync strength property for UI
        state.value.leftPlayer.strength = parseFloat(leftStrength.toFixed(1));
        state.value.rightPlayer.strength = parseFloat(rightStrength.toFixed(1));

        const leftForce = leftStrength * config.value.pullForceMultiplier;
        const rightForce = rightStrength * config.value.pullForceMultiplier;

        // Net force (Right is positive, Left is negative)
        const netForce = rightForce - leftForce;

        // --- Struggle Force (Back and Forth Motion) ---
        // A combination of sine waves creates a natural "wobble"
        const time = performance.now() / 1000;
        const totalStrength = leftStrength + rightStrength;
        const struggleOscillation =
            Math.sin(time * 8.0) * 0.4 +
            Math.sin(time * 3.7) * 0.3 +
            Math.sin(time * 1.5) * 0.2;

        // Struggle intensity scales with total strength and provides resistance
        const struggleIntensity = totalStrength * config.value.pullForceMultiplier;
        const struggleForce = struggleOscillation * struggleIntensity;

        // F = ma -> a = F/m
        const acceleration = (netForce + struggleForce) / config.value.mass;

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
        playSound(SOUND_TYPE.WIN);
    }

    function answerQuestion(playerId: PlayerId, isCorrect: boolean) {
        const player = playerId === PLAYER_ID.LEFT ? state.value.leftPlayer : state.value.rightPlayer;
        const opponent = playerId === PLAYER_ID.LEFT ? state.value.rightPlayer : state.value.leftPlayer;

        if (isCorrect) {
            playSound(SOUND_TYPE.HIT);
            player.score += 10;

            // Recruitment / Sabotage Logic
            if (state.value.roundReward) {
                if (player.crew.length < 6) {
                    // Normal recruit
                    player.crew.push(createCrewMember(state.value.roundReward));
                    setTimeout(() => playSound(SOUND_TYPE.SPAWN), 150);
                } else {
                    // Sabotage: Opponent loses weakest, but can't go below 1
                    if (opponent.crew.length > 1) {
                        // Find weakest strength
                        const oppStrengths = opponent.crew.map(c => c.character.strength);
                        const minStrength = Math.min(...oppStrengths);

                        // Find index of first character with that strength
                        const indexToRemove = opponent.crew.findIndex(c => c.character.strength === minStrength);

                        if (indexToRemove !== -1) {
                            opponent.crew.splice(indexToRemove, 1);
                            setTimeout(() => playSound(SOUND_TYPE.ELIMINATE), 150);
                        }
                    }
                }
            }
        } else {
            playSound(SOUND_TYPE.MISS);
            // Penalty Logic - Remove Weakest
            if (player.crew.length > 1) {
                // Find weakest strength
                const strengths = player.crew.map(c => c.character.strength);
                const minStrength = Math.min(...strengths);

                // Find index of first character with that strength
                const indexToRemove = player.crew.findIndex(c => c.character.strength === minStrength);

                if (indexToRemove !== -1) {
                    player.crew.splice(indexToRemove, 1);
                    setTimeout(() => playSound(SOUND_TYPE.ELIMINATE), 150);
                }
            }
        }

        // Recalculate total strength immediately for both
        player.strength = parseFloat(player.crew.reduce((sum, c) => sum + c.character.strength, 0).toFixed(1));
        opponent.strength = parseFloat(opponent.crew.reduce((sum, c) => sum + c.character.strength, 0).toFixed(1));

        // Track outcome for visual feedback
        state.value.lastOutcome = {
            type: isCorrect ? 'correct' : 'wrong',
            playerId,
            timestamp: Date.now()
        };
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

    function spawnPowerSprite() {
        // Only spawn if field is clear (START of a power event)
        if (state.value.activeSprites.length > 0) return;

        // Prepare keys: shuffle SPRITE_KEYS
        const availableKeys = [...SPRITE_KEYS];
        for (let i = availableKeys.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = availableKeys[i]!;
            availableKeys[i] = availableKeys[j]!;
            availableKeys[j] = temp;
        }

        [PLAYER_ID.LEFT, PLAYER_ID.RIGHT].forEach(pid => {
            const spriteData = POWER_SPRITES_DATA[Math.floor(Math.random() * POWER_SPRITES_DATA.length)];
            if (!spriteData) return;

            // Position: 2-32% from the player's edge
            const xPos = pid === PLAYER_ID.LEFT
                ? Math.random() * 30 + 2
                : Math.random() * 30 + 68;

            const key = availableKeys.pop() || '';

            const sprite: PowerSprite = {
                id: Math.random().toString(36).substr(2, 9),
                type: spriteData.type,
                playerId: pid,
                x: xPos,
                y: Math.random() * 60 + 20, // 20-80% vertical
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                createdAt: Date.now(),
                asset: spriteData.emoji,
                amount: spriteData.amount,
                name: spriteData.name,
                key
            };
            state.value.activeSprites.push(sprite);
        });
    }

    function capturePowerSprite(spriteId: string) {
        const spriteIndex = state.value.activeSprites.findIndex(s => s.id === spriteId);
        if (spriteIndex === -1) return;

        const sprite = state.value.activeSprites[spriteIndex];
        if (!sprite) return; // Safety check

        // Clear ALL sprites immediately (Mutual Exclusion)
        state.value.activeSprites = [];

        state.value.activePower = {
            playerId: sprite.playerId,
            type: sprite.type,
            amount: sprite.amount,
            endTime: Date.now() + POWER_CONFIG.PHASE_DURATION,
            sprite
        };

        state.value.isPaused = true;
        playSound(SOUND_TYPE.SPAWN);
    }

    function applyPower(targetInstanceId: string) {
        if (!state.value.activePower) return;

        // Find target in EITHER crew (allows applying to self or opponent)
        // User requirements said: "Note that the player can select a puller on either side of the rope; 
        // so they can accidentally increase/decrease the pulling power of a puller that is detrimental to their goal."
        let target = state.value.leftPlayer.crew.find(c => c.instanceId === targetInstanceId);
        if (!target) {
            target = state.value.rightPlayer.crew.find(c => c.instanceId === targetInstanceId);
        }

        if (target) {
            const powerType = state.value.activePower.type;
            const change = powerType === POWER_TYPE.STRENGTHEN ? 0.1 : -0.1;

            // Apply change (min 0.1 strength to avoid division by zero or negative strength issues)
            target.character.strength = Math.max(0.1, parseFloat((target.character.strength + change).toFixed(1)));

            // Decrement amount
            state.value.activePower.amount--;
            playSound(SOUND_TYPE.HIT);

            if (state.value.activePower.amount <= 0) {
                endPowerPhase();
            }
        }
    }

    function endPowerPhase() {
        state.value.activePower = null;
        state.value.isPaused = false;
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
        loadConfigs,
        capturePowerSprite,
        applyPower,
        endPowerPhase
    };
});
