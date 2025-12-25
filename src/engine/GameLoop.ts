import { ref, watch, onUnmounted } from 'vue';
import { useGameStore } from '../stores/game';
import ServiceFactory from '../services';

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
        if (store.state.isPlaying && !store.state.leftPlayer.currentQuestion) {
            const p1Topics = store.state.leftPlayer.topics;
            const p1Topic = p1Topics[Math.floor(Math.random() * p1Topics.length)];
            if (p1Topic) {
                dataService.getQuestions(p1Topic, 1).then(qs => {
                    if (qs.length > 0) store.state.leftPlayer.currentQuestion = qs[0];
                });
            }
        }
        if (store.state.isPlaying && !store.state.rightPlayer.currentQuestion) {
            const p2Topics = store.state.rightPlayer.topics;
            const p2Topic = p2Topics[Math.floor(Math.random() * p2Topics.length)];
            if (p2Topic) {
                dataService.getQuestions(p2Topic, 1).then(qs => {
                    if (qs.length > 0) store.state.rightPlayer.currentQuestion = qs[0];
                });
            }
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
