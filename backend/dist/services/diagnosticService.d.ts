export declare class DiagnosticService {
    getSubjectsForUser(direction?: string): string[];
    calculateLevel(score: number): string;
    saveDiagnosticResult(userId: string, subject: string, score: number, details?: object): Promise<any>;
    getUserDiagnosticResults(userId: string): Promise<any>;
    generateLearningPlan(userId: string, direction?: string): Promise<any>;
    getLearningPlan(userId: string): Promise<any>;
    markTopicCompleted(userId: string, itemId: string): Promise<any>;
    checkDiagnosticCompleted(userId: string, direction?: string): Promise<boolean>;
}
declare const _default: DiagnosticService;
export default _default;
//# sourceMappingURL=diagnosticService.d.ts.map