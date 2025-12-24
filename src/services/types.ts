import type { Question, Difficulty } from '../types';

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
    getQuestions(difficulty: Difficulty, count: number): Promise<Question[]>;
    saveLevel(name: string, questions: Question[]): Promise<boolean>;
    getCustomLevels(): Promise<string[]>; // Returns definitions or IDs
}
