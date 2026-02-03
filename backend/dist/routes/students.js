'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = require('express');
const studentsService_1 = __importDefault(require('../services/studentsService'));
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
  try {
    const students = await studentsService_1.default.getStudents();
    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({
      success: false,
      message: 'Не удалось получить список учащихся',
      data: [],
    });
  }
});
exports.default = router;
//# sourceMappingURL=students.js.map
