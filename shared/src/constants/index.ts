import { Direction, Subject, TargetGrade, UserStatus, AuthProvider } from '../types';

// Маппинг направлений на русские названия
export const DIRECTION_LABELS: Record<Direction, string> = {
  [Direction.PROGRAMMING]: 'Программирование',
  [Direction.ROBOTICS]: 'Робототехника',
  [Direction.MEDICINE]: 'Медицина будущего',
  [Direction.BIOTECHNOLOGY]: 'Биотехнологии',
  [Direction.CULTURE]: 'Культура',
};

// Маппинг предметов на русские названия
export const SUBJECT_LABELS: Record<Subject, string> = {
  [Subject.RUSSIAN]: 'Русский язык',
  [Subject.MATHEMATICS]: 'Математика',
  [Subject.PHYSICS]: 'Физика',
  [Subject.INFORMATICS]: 'Информатика',
  [Subject.BIOLOGY]: 'Биология',
  [Subject.HISTORY]: 'История',
  [Subject.ENGLISH]: 'Английский язык',
};

// Обязательные предметы для поступления
export const REQUIRED_SUBJECTS: Subject[] = [Subject.RUSSIAN, Subject.MATHEMATICS];

// Профильные предметы для каждого направления
export const DIRECTION_SUBJECTS: Record<Direction, Subject[]> = {
  [Direction.PROGRAMMING]: [Subject.PHYSICS, Subject.INFORMATICS],
  [Direction.ROBOTICS]: [Subject.PHYSICS, Subject.INFORMATICS],
  [Direction.MEDICINE]: [Subject.BIOLOGY],
  [Direction.BIOTECHNOLOGY]: [Subject.BIOLOGY],
  [Direction.CULTURE]: [Subject.HISTORY, Subject.ENGLISH],
};

// Маппинг классов на русские названия
export const GRADE_LABELS: Record<TargetGrade, string> = {
  [TargetGrade.GRADE_8]: '8 класс',
  [TargetGrade.GRADE_10]: '10 класс',
};

// Официальная информация
export const LYCEUM_INFO = {
  name: 'Лицей-интернат №64',
  city: 'Саратов',
  website: 'https://lic-int64-saratov-r64.gosweb.gosuslugi.ru',
  phone: '+7 (8452) 79-64-64',
  email: 'sarli64@mail.ru',
  totalStudents: 400,
  classSize: 20,
  admissionPeriod: {
    documentSubmission: 'до 14 июля',
    exams: '15-22 июля',
  },
  availableGrades: [8, 10],
};

// Маппинг классов (8-11) на русские названия
export const CURRENT_GRADE_LABELS: Record<number, string> = {
  8: '8 класс',
  9: '9 класс',
  10: '10 класс',
  11: '11 класс',
};

// Массив доступных классов
export const AVAILABLE_GRADES = [8, 9, 10, 11];

// Маппинг статусов пользователя на русские названия
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.STUDENT]: 'Уже учусь в лицее',
  [UserStatus.APPLICANT]: 'Хочу поступить',
};

// Маппинг провайдеров аутентификации на русские названия
export const AUTH_PROVIDER_LABELS: Record<AuthProvider, string> = {
  [AuthProvider.EMAIL]: 'Email и пароль',
  [AuthProvider.DNEVNIK]: 'Dnevnik.ru',
};
