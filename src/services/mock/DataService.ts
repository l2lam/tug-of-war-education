import type { IDataService } from '../types';
import type { Question, Topic, PlayerConfig } from '../types';
import { BaseDataService } from '../BaseDataService';

export class MockDataService extends BaseDataService implements IDataService {
    private customQuestions: Question[] = [];

    constructor() {
        super();
        this.loadCustomFromStorage();
    }

    private loadCustomFromStorage() {
        const stored = localStorage.getItem('mock_custom_questions');
        if (stored) {
            try {
                this.customQuestions = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse mock custom questions', e);
            }
        }
    }

    async getQuestions(topic: Topic, count: number): Promise<Question[]> {
        const library = this.getLibraryQuestions(topic);
        const custom = this.customQuestions.filter(q => q.topic === topic);
        const all = [...library, ...custom];

        // Fisher-Yates shuffle
        for (let i = all.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = all[i];
            if (temp && all[j]) {
                all[i] = all[j] as Question;
                all[j] = temp as Question;
            }
        }
        return all.slice(0, count);
    }

    async saveTopic(name: string, questions: Question[]): Promise<boolean> {
        const newQuestionsWithTopic = questions.map(q => ({ ...q, topic: name }));
        this.customQuestions.push(...newQuestionsWithTopic);
        localStorage.setItem('mock_custom_questions', JSON.stringify(this.customQuestions));
        return true;
    }

    async getCustomTopics(): Promise<string[]> {
        return this.getAllTopics(); // Redirect for now
    }

    async getAllTopics(): Promise<string[]> {
        const libraryTopics = this.getLibraryTopics();
        const customTopics = Array.from(new Set(this.customQuestions.map(q => q.topic)));
        return Array.from(new Set([...libraryTopics, ...customTopics]));
    }

    async savePlayerConfig(config: PlayerConfig): Promise<boolean> {
        const key = `player_config_${config.name}`;
        localStorage.setItem(key, JSON.stringify(config));
        return true;
    }

    async getPlayerConfig(name: string): Promise<PlayerConfig | null> {
        const key = `player_config_${name}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse player config', e);
            }
        }
        return null;
    }
}
