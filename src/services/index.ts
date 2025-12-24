import { MockDataService } from './mock/DataService';
import { MockAuthService } from './mock/AuthService';
// Import Supabase services later when implemented
import { SupabaseDataService } from './supabase/DataService';
import { SupabaseAuthService } from './supabase/AuthService';

import type { IDataService, IAuthService } from './types';

// Simple singleton factory
class ServiceFactory {
    private static dataService: IDataService;
    private static authService: IAuthService;

    static initialize(useMock = true) {
        if (useMock) {
            this.dataService = new MockDataService();
            this.authService = new MockAuthService();
        } else {
            this.dataService = new SupabaseDataService();
            this.authService = new SupabaseAuthService();
            // throw new Error('Supabase services not implemented yet');
        }
    }

    static getDataService(): IDataService {
        if (!this.dataService) {
            this.initialize();
        }
        return this.dataService;
    }

    static getAuthService(): IAuthService {
        if (!this.authService) {
            this.initialize();
        }
        return this.authService;
    }
}

export default ServiceFactory;
