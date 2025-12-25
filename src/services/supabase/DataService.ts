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

    async getQuestions(topicId: string, count: number): Promise<Question[]> {
        // Try library first
        const library = this.getLibraryQuestions(topicId);
        if (library.length > 0) return library.slice(0, count);

        if (!supabase) throw new Error('Supabase not configured');

        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('topic_id', topicId)
            .limit(count);

        if (error) throw error;
        return (data || []).map(q => ({
            id: q.id,
            text: q.text,
            options: q.options,
            correctIndex: q.correct_index,
            topicId: q.topic_id
        }));
    }

    async saveTopic(topic: Topic, questions: Question[]): Promise<boolean> {
        if (!supabase) throw new Error('Supabase not configured');

        // Upsert topic
        const { error: topicError } = await supabase
            .from('topics')
            .upsert({
                id: topic.id,
                name: topic.name,
                description: topic.description,
                updated_at: new Date().toISOString()
            });

        if (topicError) return false;

        // Upsert questions
        const linkedQs = questions.map(q => ({
            id: q.id,
            text: q.text,
            options: q.options,
            correct_index: q.correctIndex,
            topic_id: topic.id
        }));

        const { error: qsError } = await supabase
            .from('questions')
            .upsert(linkedQs);

        return !qsError;
    }

    async getAllTopics(): Promise<Topic[]> {
        const libraryTopics = this.getLibraryTopics();

        let remoteTopics: Topic[] = [];
        if (supabase) {
            const { data } = await supabase.from('topics').select('*');
            remoteTopics = data || [];
        }

        return Array.from(new Set([...libraryTopics, ...remoteTopics]));
    }

    async getTopic(id: string): Promise<Topic | null> {
        const library = this.getLibraryTopic(id);
        if (library) return library;

        if (!supabase) return null;
        const { data } = await supabase.from('topics').select('*').eq('id', id).single();
        return data || null;
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
