import type { IAuthService, User } from '../types';

export class MockAuthService implements IAuthService {
    private user: User | null = null;

    async signIn(email: string): Promise<{ user: User | null; error: any }> {
        this.user = { id: 'mock-user-123', email };
        return { user: this.user, error: null };
    }

    async signOut(): Promise<void> {
        this.user = null;
    }

    getUser(): User | null {
        return this.user;
    }
}
