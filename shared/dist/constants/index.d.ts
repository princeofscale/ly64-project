import { Direction, Subject, TargetGrade, UserStatus, AuthProvider } from '../types';
export declare const DIRECTION_LABELS: Record<Direction, string>;
export declare const SUBJECT_LABELS: Record<Subject, string>;
export declare const REQUIRED_SUBJECTS: Subject[];
export declare const DIRECTION_SUBJECTS: Record<Direction, Subject[]>;
export declare const GRADE_LABELS: Record<TargetGrade, string>;
export declare const LYCEUM_INFO: {
    name: string;
    city: string;
    website: string;
    phone: string;
    email: string;
    address: string;
    totalStudents: number;
    classSize: number;
    admissionPeriod: {
        documentSubmission: string;
        exams: string;
    };
    availableGrades: number[];
};
export declare const CURRENT_GRADE_LABELS: Record<number, string>;
export declare const AVAILABLE_GRADES: number[];
export declare const USER_STATUS_LABELS: Record<UserStatus, string>;
export declare const AUTH_PROVIDER_LABELS: Record<AuthProvider, string>;
