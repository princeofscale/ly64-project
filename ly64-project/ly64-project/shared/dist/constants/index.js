"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_PROVIDER_LABELS = exports.USER_STATUS_LABELS = exports.AVAILABLE_GRADES = exports.CURRENT_GRADE_LABELS = exports.LYCEUM_INFO = exports.GRADE_LABELS = exports.DIRECTION_SUBJECTS = exports.REQUIRED_SUBJECTS = exports.SUBJECT_LABELS = exports.DIRECTION_LABELS = void 0;
const types_1 = require("../types");
exports.DIRECTION_LABELS = {
    [types_1.Direction.PROGRAMMING]: 'Программирование',
    [types_1.Direction.ROBOTICS]: 'Робототехника',
    [types_1.Direction.MEDICINE]: 'Медицина будущего',
    [types_1.Direction.BIOTECHNOLOGY]: 'Биотехнологии',
    [types_1.Direction.CULTURE]: 'Культура',
};
exports.SUBJECT_LABELS = {
    [types_1.Subject.RUSSIAN]: 'Русский язык',
    [types_1.Subject.MATHEMATICS]: 'Математика',
    [types_1.Subject.PHYSICS]: 'Физика',
    [types_1.Subject.INFORMATICS]: 'Информатика',
    [types_1.Subject.BIOLOGY]: 'Биология',
    [types_1.Subject.CHEMISTRY]: 'Химия',
    [types_1.Subject.HISTORY]: 'История',
    [types_1.Subject.ENGLISH]: 'Английский язык',
};
exports.REQUIRED_SUBJECTS = [types_1.Subject.RUSSIAN, types_1.Subject.MATHEMATICS];
exports.DIRECTION_SUBJECTS = {
    [types_1.Direction.PROGRAMMING]: [types_1.Subject.PHYSICS, types_1.Subject.INFORMATICS],
    [types_1.Direction.ROBOTICS]: [types_1.Subject.PHYSICS, types_1.Subject.INFORMATICS],
    [types_1.Direction.MEDICINE]: [types_1.Subject.CHEMISTRY, types_1.Subject.BIOLOGY],
    [types_1.Direction.BIOTECHNOLOGY]: [types_1.Subject.CHEMISTRY, types_1.Subject.BIOLOGY],
    [types_1.Direction.CULTURE]: [types_1.Subject.HISTORY],
};
exports.GRADE_LABELS = {
    [types_1.TargetGrade.GRADE_8]: '8 класс',
    [types_1.TargetGrade.GRADE_10]: '10 класс',
};
exports.LYCEUM_INFO = {
    name: 'Лицей-интернат №64',
    city: 'Саратов',
    website: 'https://lic-int64-saratov-r64.gosweb.gosuslugi.ru',
    phone: '+7 (8452) 79-64-64',
    email: 'sarli64@mail.ru',
    address: 'Ulitsa Stepana Razina, 71, Saratov, Saratov Oblast, 410012',
    totalStudents: 400,
    classSize: 20,
    admissionPeriod: {
        documentSubmission: 'до 14 июля',
        exams: '15-22 июля',
    },
    availableGrades: [8, 10],
};
exports.CURRENT_GRADE_LABELS = {
    8: '8 класс',
    9: '9 класс',
    10: '10 класс',
    11: '11 класс',
};
exports.AVAILABLE_GRADES = [8, 9, 10, 11];
exports.USER_STATUS_LABELS = {
    [types_1.UserStatus.STUDENT]: 'Уже учусь в лицее',
    [types_1.UserStatus.APPLICANT]: 'Хочу поступить',
};
exports.AUTH_PROVIDER_LABELS = {
    [types_1.AuthProvider.EMAIL]: 'Email и пароль',
};
