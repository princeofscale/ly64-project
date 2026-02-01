import { z } from 'zod';

type AuthProvider = 'EMAIL';

interface ValidationConstants {
  readonly email: {
    readonly minLocalPartLength: number;
    readonly cyrillicPattern: RegExp;
    readonly formatPattern: RegExp;
  };
  readonly password: {
    readonly minLength: number;
    readonly maxLength: number;
    readonly lowercasePattern: RegExp;
    readonly uppercasePattern: RegExp;
    readonly digitPattern: RegExp;
  };
  readonly name: {
    readonly minLength: number;
    readonly maxLength: number;
  };
  readonly grade: {
    readonly min: number;
    readonly max: number;
  };
  readonly motivation: {
    readonly minLength: number;
    readonly maxLength: number;
  };
}

interface ValidationMessages {
  readonly email: {
    readonly invalid: string;
    readonly cyrillic: string;
    readonly format: string;
    readonly localPartTooShort: string;
  };
  readonly password: {
    readonly tooShort: string;
    readonly tooLong: string;
    readonly missingLowercase: string;
    readonly missingUppercase: string;
    readonly missingDigit: string;
    readonly required: string;
  };
  readonly name: {
    readonly tooShort: string;
    readonly tooLong: string;
  };
  readonly grade: {
    readonly notInteger: string;
    readonly tooLow: string;
    readonly tooHigh: string;
  };
  readonly motivation: {
    readonly tooShort: string;
    readonly tooLong: string;
  };
  readonly terms: {
    readonly notAccepted: string;
  };
}

class ValidationSchemas {
  private readonly constants: ValidationConstants = {
    email: {
      minLocalPartLength: 3,
      cyrillicPattern: /[а-яА-ЯёЁ]/,
      formatPattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    password: {
      minLength: 8,
      maxLength: 100,
      lowercasePattern: /[a-z]/,
      uppercasePattern: /[A-Z]/,
      digitPattern: /[0-9]/,
    },
    name: {
      minLength: 2,
      maxLength: 100,
    },
    grade: {
      min: 8,
      max: 11,
    },
    motivation: {
      minLength: 50,
      maxLength: 1000,
    },
  };

  private readonly messages: ValidationMessages = {
    email: {
      invalid: 'Некорректный email адрес',
      cyrillic: 'Email не может содержать кириллицу',
      format: 'Некорректный формат email',
      localPartTooShort: 'Часть email до @ должна содержать минимум 3 символа',
    },
    password: {
      tooShort: 'Пароль должен содержать минимум 8 символов',
      tooLong: 'Пароль слишком длинный',
      missingLowercase: 'Пароль должен содержать хотя бы одну строчную букву',
      missingUppercase: 'Пароль должен содержать хотя бы одну заглавную букву',
      missingDigit: 'Пароль должен содержать хотя бы одну цифру',
      required: 'Пароль обязателен',
    },
    name: {
      tooShort: 'Имя должно содержать минимум 2 символа',
      tooLong: 'Имя слишком длинное',
    },
    grade: {
      notInteger: 'Класс должен быть целым числом',
      tooLow: 'Минимальный класс - 8',
      tooHigh: 'Максимальный класс - 11',
    },
    motivation: {
      tooShort: 'Мотивация должна содержать минимум 50 символов',
      tooLong: 'Мотивация слишком длинная',
    },
    terms: {
      notAccepted: 'Необходимо согласиться с условиями использования',
    },
  };

  private createEmailValidator() {
    return z
      .string()
      .email({ message: this.messages.email.invalid })
      .refine((email) => !this.constants.email.cyrillicPattern.test(email), {
        message: this.messages.email.cyrillic,
      })
      .refine((email) => this.constants.email.formatPattern.test(email), {
        message: this.messages.email.format,
      })
      .refine((email) => this.validateEmailLocalPart(email), {
        message: this.messages.email.localPartTooShort,
      });
  }

  private validateEmailLocalPart(email: string): boolean {
    const localPart = email.split('@')[0];
    return localPart ? localPart.length >= this.constants.email.minLocalPartLength : false;
  }

  private createLoginEmailValidator() {
    return z
      .string()
      .email({ message: this.messages.email.invalid })
      .refine((email) => !this.constants.email.cyrillicPattern.test(email), {
        message: this.messages.email.cyrillic,
      });
  }

  private createPasswordValidator() {
    return z
      .string()
      .min(this.constants.password.minLength, { message: this.messages.password.tooShort })
      .max(this.constants.password.maxLength, { message: this.messages.password.tooLong })
      .regex(this.constants.password.lowercasePattern, { message: this.messages.password.missingLowercase })
      .regex(this.constants.password.uppercasePattern, { message: this.messages.password.missingUppercase })
      .regex(this.constants.password.digitPattern, { message: this.messages.password.missingDigit })
      .optional();
  }

  private createNameValidator() {
    return z
      .string()
      .min(this.constants.name.minLength, { message: this.messages.name.tooShort })
      .max(this.constants.name.maxLength, { message: this.messages.name.tooLong });
  }

  private createStatusValidator() {
    return z.enum(['STUDENT', 'APPLICANT']);
  }

  private createGradeValidator() {
    return z
      .number()
      .int({ message: this.messages.grade.notInteger })
      .min(this.constants.grade.min, { message: this.messages.grade.tooLow })
      .max(this.constants.grade.max, { message: this.messages.grade.tooHigh });
  }

  private createDirectionValidator() {
    return z.enum(['PROGRAMMING', 'ROBOTICS', 'MEDICINE', 'BIOTECHNOLOGY', 'CULTURE']).optional();
  }

  private createMotivationValidator() {
    return z
      .string()
      .min(this.constants.motivation.minLength, { message: this.messages.motivation.tooShort })
      .max(this.constants.motivation.maxLength, { message: this.messages.motivation.tooLong })
      .optional();
  }

  private createTermsValidator() {
    return z.boolean().refine((val) => val === true, {
      message: this.messages.terms.notAccepted,
    });
  }

  private createAuthProviderValidator() {
    return z.literal<AuthProvider>('EMAIL').default('EMAIL');
  }

  public createRegisterSchema() {
    return z.object({
      email: this.createEmailValidator(),
      password: this.createPasswordValidator(),
      name: this.createNameValidator(),
      status: this.createStatusValidator(),
      currentGrade: this.createGradeValidator(),
      desiredDirection: this.createDirectionValidator(),
      motivation: this.createMotivationValidator(),
      agreedToTerms: this.createTermsValidator(),
      authProvider: this.createAuthProviderValidator(),
    });
  }

  public createLoginSchema() {
    return z.object({
      email: this.createLoginEmailValidator(),
      password: z.string().min(1, { message: this.messages.password.required }),
    });
  }
}

const validationSchemas = new ValidationSchemas();

export const registerSchema = validationSchemas.createRegisterSchema();
export const loginSchema = validationSchemas.createLoginSchema();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
