import { Direction, Subject, TargetGrade, UserStatus, AuthProvider } from '../types';


export const DIRECTION_LABELS: Record<Direction, string> = {
  [Direction.PROGRAMMING]: 'Программирование',
  [Direction.ROBOTICS]: 'Робототехника',
  [Direction.MEDICINE]: 'Медицина будущего',
  [Direction.BIOTECHNOLOGY]: 'Биотехнологии',
  [Direction.CULTURE]: 'Культура',
};


export const SUBJECT_LABELS: Record<Subject, string> = {
  [Subject.RUSSIAN]: 'Русский язык',
  [Subject.MATHEMATICS]: 'Математика',
  [Subject.PHYSICS]: 'Физика',
  [Subject.INFORMATICS]: 'Информатика',
  [Subject.BIOLOGY]: 'Биология',
  [Subject.HISTORY]: 'История',
  [Subject.ENGLISH]: 'Английский язык',
};


export const REQUIRED_SUBJECTS: Subject[] = [Subject.RUSSIAN, Subject.MATHEMATICS];


export const DIRECTION_SUBJECTS: Record<Direction, Subject[]> = {
  [Direction.PROGRAMMING]: [Subject.PHYSICS, Subject.INFORMATICS],
  [Direction.ROBOTICS]: [Subject.PHYSICS, Subject.INFORMATICS],
  [Direction.MEDICINE]: [Subject.BIOLOGY],
  [Direction.BIOTECHNOLOGY]: [Subject.BIOLOGY],
  [Direction.CULTURE]: [Subject.HISTORY, Subject.ENGLISH],
};


export const GRADE_LABELS: Record<TargetGrade, string> = {
  [TargetGrade.GRADE_8]: '8 класс',
  [TargetGrade.GRADE_10]: '10 класс',
};


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


export const CURRENT_GRADE_LABELS: Record<number, string> = {
  8: '8 класс',
  9: '9 класс',
  10: '10 класс',
  11: '11 класс',
};


export const AVAILABLE_GRADES = [8, 9, 10, 11];


export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.STUDENT]: 'Уже учусь в лицее',
  [UserStatus.APPLICANT]: 'Хочу поступить',
};


export const AUTH_PROVIDER_LABELS: Record<AuthProvider, string> = {
  [AuthProvider.EMAIL]: 'Email и пароль',
};
