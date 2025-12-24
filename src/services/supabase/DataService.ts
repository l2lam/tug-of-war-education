import { createClient } from '@supabase/supabase-js';
import type { IDataService } from '../types';
import type { Question, Topic } from '../../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export class SupabaseDataService implements IDataService {
    async getQuestions(topic: Topic, count: number): Promise<Question[]> {
        if (!supabase) throw new Error('Supabase not configured');

        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('topic', topic)
            .limit(count);

        if (error) throw error;
        return (data || []).map(q => ({
            id: q.id,
            text: q.text,
            options: q.options,
            correctIndex: q.correct_index,
            topic: q.topic
        }));
    }

    async saveTopic(name: string, questions: Question[]): Promise<boolean> {
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

    async getCustomTopics(): Promise<string[]> {
        if (!supabase) return [];

        const { data } = await supabase.from('custom_levels').select('name');
        return (data || []).map((d: any) => d.name);
    }

    async getCustomLevels(): Promise<string[]> {
        if (!supabase) return [];

        const { data } = await supabase.from('custom_levels').select('name');
        return (data || []).map((d: any) => d.name);
    }
}
