import { z } from 'zod';

// Схема валидации для регистрации
export const registerSchema = z.object({
  // Базовые поля
  email: z.string().email('Некорректный email адрес'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .max(100, 'Пароль слишком длинный')
    .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
    .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')
    .optional(), // Optional для OAuth
  name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя слишком длинное'),

  // Новые поля
  status: z.enum(['STUDENT', 'APPLICANT'], {
    errorMap: () => ({ message: 'Статус должен быть STUDENT или APPLICANT' }),
  }),
  currentGrade: z
    .number()
    .int('Класс должен быть целым числом')
    .min(8, 'Минимальный класс - 8')
    .max(11, 'Максимальный класс - 11'),
  desiredDirection: z
    .enum(['PROGRAMMING', 'ROBOTICS', 'MEDICINE', 'BIOTECHNOLOGY', 'CULTURE'])
    .optional(),
  motivation: z
    .string()
    .min(50, 'Мотивация должна содержать минимум 50 символов')
    .max(1000, 'Мотивация слишком длинная')
    .optional(),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'Необходимо согласиться с условиями использования',
  }),

  // OAuth поля
  authProvider: z.enum(['EMAIL', 'DNEVNIK']).default('EMAIL'),
  dnevnikId: z.string().optional(),
});

// Схема валидации для входа
export const loginSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
  password: z.string().min(1, 'Пароль обязателен'),
});

// Типы для TypeScript
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
