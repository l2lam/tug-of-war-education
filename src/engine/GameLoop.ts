import { ref, watch, onUnmounted } from 'vue';
import { useGameStore } from '../stores/game';
import ServiceFactory from '../services';
import { PLAYER_ID } from '../constants';

export function useGameLoop() {
    const store = useGameStore();
    const timerInterval = ref<number | null>(null);

    function startRoundTimer() {
        if (timerInterval.value) clearInterval(timerInterval.value);

        store.state.timeLeft = store.config.roundDuration;

        timerInterval.value = window.setInterval(() => {
            if (store.state.isPaused || !store.state.isPlaying) return;

            if (store.state.timeLeft > 0) {
                store.state.timeLeft--;
            } else {
                // Round over by time
                handleRoundEnd();
            }
        }, 1000);
    }

    async function handleRoundEnd() {
        // For now, just reset timer or declare draw? 
        // In Tug of War, usually time triggers "Sudden Death" or just continues?
        // User requirement: "Rounds progress automatically... until rope passes threshold"
        // Maybe rounds are just "new questions".

        // Let's refetch questions
        await fetchNewQuestions();

        // Reset timer
        store.state.timeLeft = store.config.roundDuration;
        store.state.round++;
        store.state.isTransitioning = false;
    }

    async function fetchNewQuestions() {
        const dataService = ServiceFactory.getDataService();

        // Randomly select from enabled topics
        const p1Topics = store.state.leftPlayer.difficulties;
        const p2Topics = store.state.rightPlayer.difficulties;

        // Ensure topics arrays are not empty before selecting
        if (p1Topics.length > 0) {
            const p1Diff = p1Topics[Math.floor(Math.random() * p1Topics.length)]!;
            const q1 = await dataService.getQuestions(p1Diff, 1);
            if (q1.length > 0) store.setQuestion(PLAYER_ID.LEFT, q1[0]!);
        }

        if (p2Topics.length > 0) {
            const p2Diff = p2Topics[Math.floor(Math.random() * p2Topics.length)]!;
            const q2 = await dataService.getQuestions(p2Diff, 1);
            if (q2.length > 0) store.setQuestion(PLAYER_ID.RIGHT, q2[0]!);
        }
    }

    function startGameLoop() {
        if (store.state.isPlaying && timerInterval.value) return;

        store.state.isPlaying = true;
        store.state.isPaused = false;

        fetchNewQuestions().then(() => {
            startRoundTimer();
        });

        // Physics Loop
        const loop = () => {
            if (!store.state.isPlaying) return;

            if (!store.state.isPaused) {
                store.tick();
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    function stopGameLoop() {
        if (timerInterval.value) {
            clearInterval(timerInterval.value);
            timerInterval.value = null;
        }
        store.state.isPlaying = false;
    }

    // Watch for winner
    watch(() => store.state.winner, (newWinner) => {
        if (newWinner) {
            stopGameLoop();
        }
    });

    onUnmounted(() => {
        stopGameLoop();
    });

    return {
        startGameLoop,
        stopGameLoop,
        nextRound: handleRoundEnd
    };
}
