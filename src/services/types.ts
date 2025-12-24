import type { Question, Topic } from '../types';

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
    getCustomTopics(): Promise<string[]>; // Returns definitions or IDs
}
