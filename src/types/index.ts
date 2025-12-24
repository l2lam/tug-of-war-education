import { type PlayerId } from '../constants';

export type Difficulty = string;

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
    difficulty: Difficulty;
}

export interface PlayerConfig {
    name: string;
    difficulties: Difficulty[];
}

export interface PlayerState {
    id: PlayerId;
    name: string;
    score: number;
    strength: number; // Current pulling power (based on streak/correct answers)
    difficulties: Difficulty[];
    currentQuestion?: Question;
}

export interface GameConfig {
    winningThreshold: number; // Rope distance to win
    roundDuration: number; // seconds
}

export interface GameState {
    isPlaying: boolean;
    isPaused: boolean;
    isTransitioning: boolean; // Locks inputs during round change
    ropePosition: number; // 0 = center, -100 = left wins, 100 = right wins
    round: number;
    timeLeft: number;
    leftPlayer: PlayerState;
    rightPlayer: PlayerState;
    winner: PlayerId | null;
}
