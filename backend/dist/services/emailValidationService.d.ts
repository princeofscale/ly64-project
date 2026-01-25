export declare class EmailValidationService {
    private readonly reacherApiUrl;
    private readonly useReacherApi;
    validateEmail(email: string): Promise<boolean>;
    private validateWithReacher;
    private validateSimple;
    isNotDisposableEmail(email: string): boolean;
}
declare const _default: EmailValidationService;
export default _default;
//# sourceMappingURL=emailValidationService.d.ts.map