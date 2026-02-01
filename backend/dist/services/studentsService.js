'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.StudentsService = void 0;
const axios_1 = __importDefault(require('axios'));
let cachedStudents = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000;
class StudentsService {
  constructor() {
    this.apiUrl = 'http://kpd.sarli64.ru/api/data/students.json';
  }
  async getStudents() {
    if (cachedStudents && Date.now() - cacheTime < CACHE_DURATION) {
      return cachedStudents;
    }
    try {
      const response = await axios_1.default.get(this.apiUrl, {
        timeout: 10000,
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false,
        }),
      });
      if (response.data.isValid && Array.isArray(response.data.data)) {
        cachedStudents = response.data.data;
        cacheTime = Date.now();
        return cachedStudents;
      }
      return [];
    } catch (error) {
      console.error('Error fetching students list:', error);
      if (cachedStudents) {
        return cachedStudents;
      }
      return [];
    }
  }
  async isStudent(name) {
    const students = await this.getStudents();
    const normalizedName = name.trim().toLowerCase();
    return students.some(student => student.trim().toLowerCase() === normalizedName);
  }
}
exports.StudentsService = StudentsService;
exports.default = new StudentsService();
//# sourceMappingURL=studentsService.js.map
