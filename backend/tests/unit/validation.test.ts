/**
 * Validation Schema Unit Tests
 *
 * Tests for the Zod validation schemas including:
 * - Registration validation
 * - Login validation
 * - Input sanitization
 */

import { registerSchema, loginSchema } from '../../src/utils/validation';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    describe('valid inputs', () => {
      it('should accept valid email and password', () => {
        const input = {
          email: 'test@example.com',
          password: 'password123',
        };

        const result = loginSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept email with subdomain', () => {
        const input = {
          email: 'user@mail.example.com',
          password: 'test',
        };

        const result = loginSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept email with plus sign', () => {
        const input = {
          email: 'user+tag@example.com',
          password: 'test',
        };

        const result = loginSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept email with dots in local part', () => {
        const input = {
          email: 'first.last@example.com',
          password: 'test',
        };

        const result = loginSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    describe('invalid email', () => {
      it('should reject missing email', () => {
        const input = { password: 'password123' };
        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it('should reject empty email', () => {
        const input = { email: '', password: 'password123' };
        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it('should reject email without @', () => {
        const input = { email: 'invalid-email', password: 'password123' };
        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it('should reject email without domain', () => {
        const input = { email: 'user@', password: 'password123' };
        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it('should reject email with Cyrillic characters', () => {
        const input = { email: 'тест@example.com', password: 'password123' };
        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
        // The validation might fail on email format first, or on Cyrillic check
        // Either way, it should be rejected
      });

      it('should reject email with Cyrillic in domain', () => {
        const input = { email: 'user@пример.com', password: 'password123' };
        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
      });
    });

    describe('invalid password', () => {
      it('should reject missing password', () => {
        const input = { email: 'test@example.com' };
        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it('should reject empty password', () => {
        const input = { email: 'test@example.com', password: '' };
        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain('обязателен');
        }
      });
    });
  });

  describe('registerSchema', () => {
    const validInput = {
      email: 'newuser@example.com',
      password: 'SecurePass123',
      name: 'Иван Иванов',
      status: 'STUDENT' as const,
      currentGrade: 9,
      desiredDirection: 'PROGRAMMING' as const,
      motivation: 'Хочу стать программистом',
      agreedToTerms: true,
    };

    describe('valid inputs', () => {
      it('should accept valid registration data', () => {
        const result = registerSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });

      it('should accept APPLICANT status', () => {
        const input = { ...validInput, status: 'APPLICANT' as const };
        const result = registerSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept grade 8', () => {
        const input = { ...validInput, currentGrade: 8 };
        const result = registerSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept grade 11', () => {
        const input = { ...validInput, currentGrade: 11 };
        const result = registerSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept all valid directions', () => {
        const directions = ['PROGRAMMING', 'ROBOTICS', 'MEDICINE', 'BIOTECHNOLOGY', 'CULTURE'] as const;

        for (const direction of directions) {
          const input = { ...validInput, desiredDirection: direction };
          const result = registerSchema.safeParse(input);
          expect(result.success).toBe(true);
        }
      });

      it('should accept registration without password (OAuth)', () => {
        const { password, ...inputWithoutPassword } = validInput;
        const result = registerSchema.safeParse(inputWithoutPassword);
        expect(result.success).toBe(true);
      });

      it('should accept registration without optional fields', () => {
        const input = {
          email: 'test@example.com',
          name: 'Test User',
          status: 'STUDENT' as const,
          currentGrade: 9,
          agreedToTerms: true,
        };
        const result = registerSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    describe('invalid email', () => {
      it('should reject email with short local part', () => {
        const input = { ...validInput, email: 'ab@example.com' };
        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some(i => i.message.includes('3 символа'))).toBe(true);
        }
      });

      it('should reject invalid email format', () => {
        const input = { ...validInput, email: 'not-an-email' };
        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
      });
    });

    describe('invalid password', () => {
      it('should reject password shorter than 8 characters', () => {
        const input = { ...validInput, password: 'Short1' };
        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain('8 символов');
        }
      });

      it('should reject password without lowercase letter', () => {
        const input = { ...validInput, password: 'ALLUPPERCASE123' };
        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain('строчную');
        }
      });

      it('should reject password without uppercase letter', () => {
        const input = { ...validInput, password: 'alllowercase123' };
        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain('заглавную');
        }
      });

      it('should reject password without digit', () => {
        const input = { ...validInput, password: 'NoDigitsHere' };
        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain('цифру');
        }
      });
    });

    describe('invalid name', () => {
      it('should reject name shorter than 2 characters', () => {
        const input = { ...validInput, name: 'A' };
        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain('2 символа');
        }
      });

      it('should reject empty name', () => {
        const input = { ...validInput, name: '' };
        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
      });
    });

    describe('invalid grade', () => {
      it('should reject grade below 8', () => {
        const input = { ...validInput, currentGrade: 7 };
        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain('8');
        }
      });

      it('should reject grade above 11', () => {
        const input = { ...validInput, currentGrade: 12 };
        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain('11');
        }
      });

      it('should reject non-integer grade', () => {
        const input = { ...validInput, currentGrade: 9.5 };
        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain('целым');
        }
      });
    });

    describe('terms agreement', () => {
      it('should reject if terms not agreed', () => {
        const input = { ...validInput, agreedToTerms: false };
        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain('условиями');
        }
      });

      it('should reject if agreedToTerms is missing', () => {
        const { agreedToTerms, ...inputWithoutTerms } = validInput;
        const result = registerSchema.safeParse(inputWithoutTerms);

        expect(result.success).toBe(false);
      });
    });

    describe('motivation field', () => {
      it('should accept long motivation within limit', () => {
        const input = { ...validInput, motivation: 'A'.repeat(1000) };
        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(true);
      });

      it('should reject motivation exceeding 1000 characters', () => {
        const input = { ...validInput, motivation: 'A'.repeat(1001) };
        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain('длинная');
        }
      });
    });
  });

  describe('type inference', () => {
    it('should infer correct types from registerSchema', () => {
      const input = registerSchema.parse({
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'Test User',
        status: 'STUDENT',
        currentGrade: 9,
        agreedToTerms: true,
      });

      // TypeScript would catch type errors at compile time
      // These assertions verify runtime types
      expect(typeof input.email).toBe('string');
      expect(typeof input.name).toBe('string');
      expect(typeof input.currentGrade).toBe('number');
      expect(typeof input.agreedToTerms).toBe('boolean');
    });

    it('should infer correct types from loginSchema', () => {
      const input = loginSchema.parse({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(typeof input.email).toBe('string');
      expect(typeof input.password).toBe('string');
    });
  });
});
