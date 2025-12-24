import type { IDataService } from '../types';
import type { Question, Topic } from '../../types';

export class MockDataService implements IDataService {
    private questions: Question[] = [
        { id: '1', text: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctIndex: 1, topic: 'grade-1-math' },
        { id: '2', text: 'Which planet is the red planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctIndex: 1, topic: 'grade-9-science' },
        { id: '3', text: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Vacuole'], correctIndex: 1, topic: 'grade-9-science' },
        { id: '4', text: 'In what year did WWII end?', options: ['1943', '1944', '1945', '1946'], correctIndex: 2, topic: 'history-general' },
        { id: '5', text: 'What is the square root of 64?', options: ['6', '7', '8', '9'], correctIndex: 2, topic: 'grade-1-math' },

        // Grade 12 Math
        { id: 'm12-1', text: 'Derivative of x^2?', options: ['x', '2x', '2', 'x^2'], correctIndex: 1, topic: 'grade-12-math' },
        { id: 'm12-2', text: 'Integral of 1/x?', options: ['x', 'ln|x|', 'e^x', '1'], correctIndex: 1, topic: 'grade-12-math' },

        // More Grade 9 Science
        { id: 's9-1', text: 'Chemical symbol for Gold?', options: ['Ag', 'Au', 'Fe', 'Cu'], correctIndex: 1, topic: 'grade-9-science' },
        { id: 's9-2', text: 'What is the speed of light approx?', options: ['300k km/s', '150k km/s', '500k km/s', '1M km/s'], correctIndex: 0, topic: 'grade-9-science' },
    ];

    async getQuestions(topic: Topic, count: number): Promise<Question[]> {
        const filtered = [...this.questions.filter(q => q.topic === topic)];
        // Fisher-Yates shuffle
        for (let i = filtered.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = filtered[i];
            if (temp && filtered[j]) {
                filtered[i] = filtered[j] as Question;
                filtered[j] = temp as Question;
            }
        }
        return filtered.slice(0, count);
    }

    async saveTopic(name: string, questions: Question[]): Promise<boolean> {
        // For simplicity in mock, we'll just add these to the existing questions array
        // and ensure they have the correct topic.
        const newQuestionsWithTopic = questions.map(q => ({ ...q, topic: name }));
        this.questions.push(...newQuestionsWithTopic);
        console.log(`[MOCK] Saved level ${name} with ${questions.length} questions.`);
        return true;
    }

    async getCustomTopics(): Promise<string[]> {
        // Return all keys except the default ones if we want to distinguish, 
        // or just all keys? The interface says getCustomLevels.
        // Let's return keys that are NOT the defaults.
        const defaults = ['grade-1-math', 'grade-12-math', 'grade-9-science'];
        // MOCK_QUESTIONS is not defined, assuming it should be this.questions
        const allTopics = Array.from(new Set(this.questions.map(q => q.topic)));
        return allTopics.filter(k => !defaults.includes(k));
    }
}
