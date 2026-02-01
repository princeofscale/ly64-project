import { z } from 'zod';
export declare const registerSchema: z.ZodObject<
  {
    email: z.ZodEffects<
      z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>,
      string,
      string
    >;
    password: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    status: z.ZodEnum<['STUDENT', 'APPLICANT']>;
    currentGrade: z.ZodNumber;
    desiredDirection: z.ZodOptional<
      z.ZodEnum<['PROGRAMMING', 'ROBOTICS', 'MEDICINE', 'BIOTECHNOLOGY', 'CULTURE']>
    >;
    motivation: z.ZodOptional<z.ZodString>;
    agreedToTerms: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
    authProvider: z.ZodDefault<z.ZodLiteral<'EMAIL'>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    email: string;
    status: 'STUDENT' | 'APPLICANT';
    name: string;
    currentGrade: number;
    agreedToTerms: boolean;
    authProvider: 'EMAIL';
    password?: string | undefined;
    desiredDirection?:
      | 'PROGRAMMING'
      | 'ROBOTICS'
      | 'MEDICINE'
      | 'BIOTECHNOLOGY'
      | 'CULTURE'
      | undefined;
    motivation?: string | undefined;
  },
  {
    email: string;
    status: 'STUDENT' | 'APPLICANT';
    name: string;
    currentGrade: number;
    agreedToTerms: boolean;
    password?: string | undefined;
    desiredDirection?:
      | 'PROGRAMMING'
      | 'ROBOTICS'
      | 'MEDICINE'
      | 'BIOTECHNOLOGY'
      | 'CULTURE'
      | undefined;
    motivation?: string | undefined;
    authProvider?: 'EMAIL' | undefined;
  }
>;
export declare const loginSchema: z.ZodObject<
  {
    email: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    email: string;
    password: string;
  },
  {
    email: string;
    password: string;
  }
>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
//# sourceMappingURL=validation.d.ts.map
