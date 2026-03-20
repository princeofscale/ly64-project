"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DifficultyLevel = exports.QuestionType = exports.ExamType = exports.TargetGrade = exports.Subject = exports.Direction = exports.AuthProvider = exports.UserStatus = void 0;
var UserStatus;
(function (UserStatus) {
    UserStatus["STUDENT"] = "STUDENT";
    UserStatus["APPLICANT"] = "APPLICANT";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var AuthProvider;
(function (AuthProvider) {
    AuthProvider["EMAIL"] = "EMAIL";
})(AuthProvider || (exports.AuthProvider = AuthProvider = {}));
var Direction;
(function (Direction) {
    Direction["PROGRAMMING"] = "PROGRAMMING";
    Direction["ROBOTICS"] = "ROBOTICS";
    Direction["MEDICINE"] = "MEDICINE";
    Direction["BIOTECHNOLOGY"] = "BIOTECHNOLOGY";
    Direction["CULTURE"] = "CULTURE";
})(Direction || (exports.Direction = Direction = {}));
var Subject;
(function (Subject) {
    Subject["RUSSIAN"] = "RUSSIAN";
    Subject["MATHEMATICS"] = "MATHEMATICS";
    Subject["PHYSICS"] = "PHYSICS";
    Subject["INFORMATICS"] = "INFORMATICS";
    Subject["BIOLOGY"] = "BIOLOGY";
    Subject["CHEMISTRY"] = "CHEMISTRY";
    Subject["HISTORY"] = "HISTORY";
    Subject["ENGLISH"] = "ENGLISH";
    Subject["SOCIAL"] = "SOCIAL";
    Subject["LITERATURE"] = "LITERATURE";
})(Subject || (exports.Subject = Subject = {}));
var TargetGrade;
(function (TargetGrade) {
    TargetGrade["GRADE_8"] = "GRADE_8";
    TargetGrade["GRADE_10"] = "GRADE_10";
})(TargetGrade || (exports.TargetGrade = TargetGrade = {}));
var ExamType;
(function (ExamType) {
    ExamType["LYCEUM_ENTRANCE"] = "LYCEUM_ENTRANCE";
    ExamType["OGE"] = "OGE";
    ExamType["EGE"] = "EGE";
    ExamType["VPR"] = "VPR";
})(ExamType || (exports.ExamType = ExamType = {}));
var QuestionType;
(function (QuestionType) {
    QuestionType["SINGLE_CHOICE"] = "SINGLE_CHOICE";
    QuestionType["MULTIPLE_CHOICE"] = "MULTIPLE_CHOICE";
    QuestionType["TEXT_INPUT"] = "TEXT_INPUT";
    QuestionType["DETAILED_ANSWER"] = "DETAILED_ANSWER";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
var DifficultyLevel;
(function (DifficultyLevel) {
    DifficultyLevel["EASY"] = "EASY";
    DifficultyLevel["MEDIUM"] = "MEDIUM";
    DifficultyLevel["HARD"] = "HARD";
})(DifficultyLevel || (exports.DifficultyLevel = DifficultyLevel = {}));
