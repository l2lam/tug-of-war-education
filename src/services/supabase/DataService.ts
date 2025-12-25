import { createClient } from '@supabase/supabase-js';
import type { IDataService } from '../types';
import type { Question, Topic, PlayerConfig } from '../types';
import { BaseDataService } from '../BaseDataService';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export class SupabaseDataService extends BaseDataService implements IDataService {
    constructor() {
        super();
    }

    async getQuestions(topic: Topic, count: number): Promise<Question[]> {
        // Try library first
        const library = this.getLibraryQuestions(topic);
        if (library.length > 0) return library.slice(0, count);

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

        const { error } = await supabase
            .from('custom_topics')
            .insert({
                name,
                questions_json: questions
            });

        return !error;
    }

    async getCustomTopics(): Promise<string[]> {
        return this.getAllTopics();
    }

    async getAllTopics(): Promise<string[]> {
        const libraryTopics = this.getLibraryTopics();

        let customTopics: string[] = [];
        if (supabase) {
            const { data } = await supabase.from('custom_topics').select('name');
            customTopics = (data || []).map((d: any) => d.name);
        }

        return Array.from(new Set([...libraryTopics, ...customTopics]));
    }

    async savePlayerConfig(config: PlayerConfig): Promise<boolean> {
        if (!supabase) return false;

        const { error } = await supabase
            .from('player_configs')
            .upsert({
                name: config.name,
                topics: config.topics,
                updated_at: new Date().toISOString()
            }, { onConflict: 'name' });

        return !error;
    }

    async getPlayerConfig(name: string): Promise<PlayerConfig | null> {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('player_configs')
            .select('*')
            .eq('name', name)
            .single();

        if (error || !data) return null;

        return {
            name: data.name,
            topics: data.topics
        };
    }
}
