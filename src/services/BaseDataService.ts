import type { Question, Topic } from '../types';

export abstract class BaseDataService {
    protected libraryQuestions: Question[] = [];

    constructor() {
        this.loadLibrary();
    }

    private loadLibrary() {
        const modules = import.meta.glob('../data/topics/*.json', { eager: true });
        const questions: Question[] = [];

        for (const path in modules) {
            const content = (modules[path] as any).default;
            if (Array.isArray(content)) {
                // Derive topic name from filename (e.g., grade-1-math.json -> grade-1-math)
                const topicName = path.split('/').pop()?.replace('.json', '') || 'unknown';
                const questionsWithTopic = content.map(q => ({
                    ...q,
                    topic: topicName
                }));
                questions.push(...questionsWithTopic);
            }
        }
        this.libraryQuestions = questions;
    }

    public getLibraryTopics(): string[] {
        return Array.from(new Set(this.libraryQuestions.map(q => q.topic)));
    }

    protected getLibraryQuestions(topic: Topic): Question[] {
        return this.libraryQuestions.filter(q => q.topic === topic);
    }
}
