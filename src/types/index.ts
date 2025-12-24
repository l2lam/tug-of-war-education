import { type PlayerId } from '../constants';

export type Topic = string;

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
    topic: Topic;
}

export interface PlayerConfig {
    name: string;
    topics: Topic[];
}

export interface PlayerState {
    id: PlayerId;
    name: string;
    score: number;
    strength: number; // Current pulling power (based on streak/correct answers)
    topics: Topic[];
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
    ropePosition: number; // 0 = center, range +/- 100 roughly (visuals will scale)
    ropeVelocity: number;
    round: number;
    timeLeft: number;
    leftPlayer: PlayerState;
    rightPlayer: PlayerState;
    p1Config: PlayerConfig;
    p2Config: PlayerConfig;
    winner: PlayerId | null;
}
