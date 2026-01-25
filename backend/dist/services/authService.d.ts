import { RegisterInput, LoginInput } from '../utils/validation';
export declare class AuthService {
    generateUsername(email: string): Promise<string>;
    register(data: RegisterInput): Promise<{
        user: {
            email: string;
            status: string;
            name: string;
            currentGrade: number;
            desiredDirection: string | null;
            motivation: string | null;
            authProvider: string;
            id: string;
            createdAt: Date;
            username: string;
            avatar: string | null;
            updatedAt: Date;
        };
        token: string;
    }>;
    login(data: LoginInput): Promise<{
        user: {
            id: string;
            email: string;
            username: string;
            name: string;
            status: string;
            currentGrade: number;
            desiredDirection: string | null;
            motivation: string | null;
            authProvider: string;
            avatar: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
    }>;
    getCurrentUser(userId: string): Promise<{
        email: string;
        status: string;
        name: string;
        currentGrade: number;
        desiredDirection: string | null;
        motivation: string | null;
        authProvider: string;
        id: string;
        createdAt: Date;
        username: string;
        avatar: string | null;
        updatedAt: Date;
        progress: {
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            direction: string | null;
            targetGrade: string | null;
            completedTests: string;
            stats: string;
        } | null;
    }>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=authService.d.ts.map