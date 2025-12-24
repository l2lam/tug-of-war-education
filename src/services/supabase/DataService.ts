import type { IDataService } from '../types';
import type { Question, Difficulty } from '../../types';
import { supabase } from './client';

export class SupabaseDataService implements IDataService {
    async getQuestions(difficulty: Difficulty, count: number): Promise<Question[]> {
        if (!supabase) throw new Error('Supabase not configured');

        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('difficulty', difficulty)
            // Random sorting in SQL is tricky, usually use .rpc() or fetch more and shuffle
            .limit(count); // Optimistic limit

        if (error) throw error;

        // For now assuming DB schema matches type or we map it
        return (data || []).map((q: any) => ({
            id: q.id,
            text: q.question_text,
            options: q.options, // Assuming JSON array
            correctIndex: q.correct_index,
            difficulty: q.difficulty
        }));
    }

    async saveLevel(name: string, questions: Question[]): Promise<boolean> {
        if (!supabase) throw new Error('Supabase not configured');

        // Conceptual implementation for custom levels table
        const { error } = await supabase
            .from('custom_levels')
            .insert({
                name,
                questions_json: questions,
                // user_id: ... needs auth context
            });

        return !error;
    }

    async getCustomLevels(): Promise<string[]> {
        if (!supabase) return [];

        const { data } = await supabase.from('custom_levels').select('name');
        return (data || []).map((d: any) => d.name);
    }
}
