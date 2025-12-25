import type { Question, Topic, PlayerConfig } from '../types';
export type { Question, Topic, PlayerConfig };

export interface User {
    id: string;
    email: string;
}

export interface IAuthService {
    signIn(email: string): Promise<{ user: User | null; error: any }>;
    signOut(): Promise<void>;
    getUser(): User | null;
}

export interface IDataService {
    getQuestions(topic: Topic, count: number): Promise<Question[]>;
    saveTopic(name: string, questions: Question[]): Promise<boolean>;
    getCustomTopics(): Promise<string[]>; // Deprecated
    getAllTopics(): Promise<string[]>;

    // Config Persistence
    savePlayerConfig(config: PlayerConfig): Promise<boolean>;
    getPlayerConfig(name: string): Promise<PlayerConfig | null>;
}
