import { type PlayerId, type PowerType } from '../constants';

export interface PowerSprite {
    id: string; // Unique ID for the sprite instance
    type: PowerType;
    playerId: PlayerId; // The player who can catch it
    x: number; // 0-100% relative to player's rope area
    y: number; // 0-100% vertical
    vx: number; // Velocity x
    vy: number; // Velocity y
    createdAt: number; // Timestamp when sprite was spawned
    asset: string; // Emoji character
    amount: number; // Power amount
    name: string; // Name of the power
}

export interface ActivePower {
    playerId: PlayerId;
    type: PowerType;
    amount: number; // Remaining power to apply (e.g., 5)
    endTime: number;
    sprite: PowerSprite; // Reference to the source sprite
}

export interface Topic {
    id: string;
    name: string;
    description?: string;
    category?: string;
    isBuiltIn?: boolean;
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

export interface CrewMember {
    instanceId: string;
    character: Character;
}

export interface PlayerState {
    id: PlayerId;
    name: string;
    score: number;
    strength: number; // Current pulling power (based on streak/correct answers)
    crew: CrewMember[]; // The team of animals pulling
    topics: string[];
    currentQuestion?: Question;
}

export interface GameConfig {
    winningThreshold: number; // Rope distance to win
    roundDuration: number; // seconds
}

export interface GameOutcome {
    type: 'correct' | 'wrong';
    playerId: PlayerId;
    timestamp: number;
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
    activeSprites: PowerSprite[];
    activePower: ActivePower | null;
    lastOutcome?: GameOutcome;
}
