import type { Question, Topic } from '../types';

export abstract class BaseDataService {
    protected libraryTopics: Topic[] = [];
    protected libraryQuestions: Map<string, Question[]> = new Map();

    constructor() {
        this.loadLibrary();
    }

    private loadLibrary() {
        const modules = import.meta.glob('../data/topics/*.json', { eager: true });

        for (const path in modules) {
            const content = (modules[path] as any).default;
            // Support both old array format (auto-derived topic) and new hierarchical object
            if (Array.isArray(content)) {
                const topicId = path.split('/').pop()?.replace('.json', '') || 'unknown';
                const topic: Topic = { id: topicId, name: topicId.replace(/-/g, ' ').toUpperCase() };
                this.libraryTopics.push(topic);

                const questions = content.map(q => ({ ...q, topicId: topic.id }));
                this.libraryQuestions.set(topic.id, questions);
            } else if (content && typeof content === 'object') {
                const topic: Topic = {
                    id: content.id || path.split('/').pop()?.replace('.json', '') || 'unknown',
                    name: content.name || 'Unknown Topic',
                    description: content.description
                };
                this.libraryTopics.push(topic);

                const questions = (content.questions || []).map((q: any) => ({
                    ...q,
                    topicId: topic.id
                }));
                this.libraryQuestions.set(topic.id, questions);
            }
        }
    }

    public getLibraryTopics(): Topic[] {
        return this.libraryTopics;
    }

    public getLibraryQuestions(topicId: string): Question[] {
        return this.libraryQuestions.get(topicId) || [];
    }

    public getLibraryTopic(id: string): Topic | null {
        return this.libraryTopics.find(t => t.id === id) || null;
    }
}
