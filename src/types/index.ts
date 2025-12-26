import { type PlayerId } from '../constants';

export interface Topic {
    id: string;
    name: string;
    description?: string;
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
    topicId: string;
}

export interface Character {
    id: string;
    name: string;
    emoji: string;
    strength: number;
}

export interface VariableDefinition {
    type?: 'integer'; // Default is integer
    min: number;
    max: number;
}

export interface QuestionTemplate extends Question {
    variables?: Record<string, VariableDefinition>;
}

export interface PlayerConfig {
    name: string;
    topics: string[]; // Store topic IDs
}

export interface PlayerState {
    id: PlayerId;
    name: string;
    score: number;
    strength: number; // Current pulling power (based on streak/correct answers)
    crew: Character[]; // The team of animals pulling
    topics: string[];
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
    roundReward?: Character; // The character up for grabs this round
}
