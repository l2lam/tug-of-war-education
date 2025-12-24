import type { IDataService } from '../types';
import type { Question, Difficulty } from '../../types';

const MOCK_QUESTIONS: Record<string, Question[]> = {
    'grade-1-math': [
        { id: '1', text: '1 + 1 = ?', options: ['1', '2', '3', '4'], correctIndex: 1, difficulty: 'grade-1-math' },
        { id: '2', text: '2 + 3 = ?', options: ['5', '6', '4', '1'], correctIndex: 0, difficulty: 'grade-1-math' },
        { id: '3', text: '5 - 2 = ?', options: ['2', '3', '4', '7'], correctIndex: 1, difficulty: 'grade-1-math' },
        { id: '4', text: '10 - 5 = ?', options: ['2', '15', '5', '0'], correctIndex: 2, difficulty: 'grade-1-math' },
        { id: '5', text: '2 x 3 = ?', options: ['5', '6', '8', '9'], correctIndex: 1, difficulty: 'grade-1-math' },
    ],
    'grade-12-math': [
        { id: '10', text: 'Derivative of x^2?', options: ['x', '2x', 'x^2', '2'], correctIndex: 1, difficulty: 'grade-12-math' },
        { id: '11', text: 'Integral of 1/x?', options: ['ln|x|', '2x', '-1/x^2', 'e^x'], correctIndex: 0, difficulty: 'grade-12-math' },
    ],
    'grade-9-science': [
        { id: '20', text: 'Powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Wall'], correctIndex: 1, difficulty: 'grade-9-science' },
        { id: '21', text: 'Symbol for Gold?', options: ['Ag', 'Au', 'Fe', 'Cu'], correctIndex: 1, difficulty: 'grade-9-science' },
    ]
};

export class MockDataService implements IDataService {
    async getQuestions(difficulty: Difficulty, count: number): Promise<Question[]> {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const pool = MOCK_QUESTIONS[difficulty] || [];
        // Randomly sample
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    async saveLevel(name: string, questions: Question[]): Promise<boolean> {
        // In-memory save
        MOCK_QUESTIONS[name] = questions;
        console.log(`[MOCK] Saved level ${name} with ${questions.length} questions.`);
        return true;
    }

    async getCustomLevels(): Promise<string[]> {
        // Return all keys except the default ones if we want to distinguish, 
        // or just all keys? The interface says getCustomLevels.
        // Let's return keys that are NOT the defaults.
        const defaults = ['grade-1-math', 'grade-12-math', 'grade-9-science'];
        return Object.keys(MOCK_QUESTIONS).filter(k => !defaults.includes(k));
    }
}
