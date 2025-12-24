import type { IAuthService, User } from '../types';
import { supabase } from './client';

export class SupabaseAuthService implements IAuthService {
    async signIn(email: string): Promise<{ user: User | null; error: any }> {
        if (!supabase) return { user: null, error: 'Supabase not configured' };

        const { error } = await supabase.auth.signInWithOtp({ email });
        // This just sends the Magic Link. 
        // The session is handled by Supabase listener usually.
        return { user: null, error };
    }

    async signOut(): Promise<void> {
        if (supabase) await supabase.auth.signOut();
    }

    getUser(): User | null {
        // const u = supabase?.auth.getUser();
        // getUser is async usually in latest SDK or need to check session
        // Simplified for now
        return null;
    }
}
