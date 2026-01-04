import type { IDataService, Question, Topic, PlayerConfig } from '../types';
import { BaseDataService } from '../BaseDataService';
import { STORAGE_KEYS } from '../../constants';

export class MockDataService extends BaseDataService implements IDataService {
    private customTopics: Topic[] = [];
    private customQuestions: Question[] = [];

    constructor() {
        super();
        this.loadCustomFromStorage();
    }

    private loadCustomFromStorage() {
        const storedTopics = localStorage.getItem(STORAGE_KEYS.CUSTOM_TOPICS);
        const storedQs = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);

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

        localStorage.setItem(STORAGE_KEYS.CUSTOM_TOPICS, JSON.stringify(this.customTopics));
        localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(this.customQuestions));
        return true;
    }

    async getTopicQuestions(topicId: string): Promise<Question[]> {
        const library = this.getLibraryQuestions(topicId);
        const custom = this.customQuestions.filter(q => q.topicId === topicId);
        return [...library, ...custom];
    }

    async getAllTopics(): Promise<Topic[]> {
        const libraryTopics = this.getLibraryTopics();
        const custom = this.customTopics.map(t => ({ ...t, isBuiltIn: false }));
        return Array.from(new Set([...libraryTopics, ...custom]));
    }

    async getTopic(id: string): Promise<Topic | null> {
        const library = this.getLibraryTopic(id);
        if (library) return library;
        const custom = this.customTopics.find(t => t.id === id);
        return custom ? { ...custom, isBuiltIn: false } : null;
    }

    async savePlayerConfig(config: PlayerConfig): Promise<boolean> {
        const key = `${STORAGE_KEYS.PLAYER_CONFIG_PREFIX}${config.name}`;
        localStorage.setItem(key, JSON.stringify(config));
        return true;
    }

    async getPlayerConfig(name: string): Promise<PlayerConfig | null> {
        const key = `${STORAGE_KEYS.PLAYER_CONFIG_PREFIX}${name}`;
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
