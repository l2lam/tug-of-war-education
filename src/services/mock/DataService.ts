import type { IDataService } from '../types';
import type { Question, Topic, PlayerConfig } from '../types';
import { BaseDataService } from '../BaseDataService';

export class MockDataService extends BaseDataService implements IDataService {
    private customTopics: Topic[] = [];
    private customQuestions: Question[] = [];

    constructor() {
        super();
        this.loadCustomFromStorage();
    }

    private loadCustomFromStorage() {
        const storedTopics = localStorage.getItem('mock_custom_topics');
        const storedQs = localStorage.getItem('mock_custom_questions');

        if (storedTopics) {
            try {
                this.customTopics = JSON.parse(storedTopics);
            } catch (e) { console.error(e); }
        }
        if (storedQs) {
            try {
                this.customQuestions = JSON.parse(storedQs);
            } catch (e) { console.error(e); }
        }
    }

    async getQuestions(topicId: string, count: number): Promise<Question[]> {
        const library = this.getLibraryQuestions(topicId);
        const custom = this.customQuestions
            .filter(q => q.topicId === topicId)
            .map(q => this.instantiateQuestion(q));
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

    async saveTopic(topic: Topic, questions: Question[]): Promise<boolean> {
        // Update or Add topic
        const index = this.customTopics.findIndex(t => t.id === topic.id);
        if (index > -1) {
            this.customTopics[index] = topic;
        } else {
            this.customTopics.push(topic);
        }

        // Add questions linked to this topic
        const linkedQs = questions.map(q => ({ ...q, topicId: topic.id }));
        this.customQuestions = [
            ...this.customQuestions.filter(q => q.topicId !== topic.id),
            ...linkedQs
        ];

        localStorage.setItem('mock_custom_topics', JSON.stringify(this.customTopics));
        localStorage.setItem('mock_custom_questions', JSON.stringify(this.customQuestions));
        return true;
    }

    async getAllTopics(): Promise<Topic[]> {
        const libraryTopics = this.getLibraryTopics();
        return Array.from(new Set([...libraryTopics, ...this.customTopics]));
    }

    async getTopic(id: string): Promise<Topic | null> {
        return this.getLibraryTopic(id) || this.customTopics.find(t => t.id === id) || null;
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
