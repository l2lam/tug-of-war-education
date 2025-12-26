import type { Question, QuestionTemplate, Topic } from '../types';

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
                // ... (existing array logic)
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
        const templates = this.libraryQuestions.get(topicId) || [];
        return templates.map(q => this.instantiateQuestion(q));
    }

    protected instantiateQuestion(q: Question | QuestionTemplate): Question {
        const template = q as QuestionTemplate;
        if (!template.variables) {
            return q;
        }

        // 1. Generate variable values
        const values: Record<string, number> = {};
        for (const [key, def] of Object.entries(template.variables)) {
            const range = def.max - def.min + 1;
            values[key] = Math.floor(Math.random() * range) + def.min;
        }

        // 2. Helper to evaluate string with placeholders
        const evaluate = (str: string): string => {
            // Find {{...}} blocks and evaluate them as expressions with variables in scope
            return str.replace(/{{(.*?)}}/g, (_, expression) => {
                try {
                    // Safe-ish eval: allow alphanumeric (vars) and math chars
                    if (!/^[0-9+\-*/().\sA-Za-z]+$/.test(expression)) {
                        console.warn('Unsafe expression skipped:', expression);
                        return `{{${expression}}}`; // Return original if unsafe
                    }

                    const keys = Object.keys(values);
                    const args = Object.values(values);
                    // Create function with variable names as arguments
                    // eslint-disable-next-line no-new-func
                    const func = new Function(...keys, `return (${expression})`);
                    return func(...args).toString();
                } catch (e) {
                    console.error('Failed to eval expression:', expression, e);
                    return `{{${expression}}}`;
                }
            });
        };

        // 3. Instantiate text and options
        return {
            ...q,
            id: q.id + '-' + Math.random().toString(36).substr(2, 5), // Unique ID for this instance
            text: evaluate(q.text),
            options: q.options.map(opt => evaluate(opt))
        };
    }

    public getLibraryTopic(id: string): Topic | null {
        return this.libraryTopics.find(t => t.id === id) || null;
    }
}
