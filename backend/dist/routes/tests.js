'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = require('express');
const auth_1 = require('../middlewares/auth');
const database_1 = require('../config/database');
const antiCheatService_1 = __importDefault(require('../services/antiCheatService'));
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, async (req, res) => {
  try {
    const { subject, examType, isDiagnostic } = req.query;
    const where = {};
    if (subject) where.subject = subject;
    if (examType) where.examType = examType;
    if (isDiagnostic !== undefined) where.isDiagnostic = isDiagnostic === 'true';
    const tests = await database_1.prisma.test.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        examType: true,
        targetGrade: true,
        isDiagnostic: true,
        timeLimit: true,
        _count: { select: { questions: true } },
      },
    });
    res.json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка получения тестов' });
  }
});
router.get('/:testId/start', auth_1.authenticateToken, async (req, res) => {
  try {
    const { testId } = req.params;
    const randomized = await antiCheatService_1.default.getRandomizedQuestions(testId);
    if (!randomized) {
      return res.status(404).json({ success: false, message: 'Тест не найден' });
    }
    res.json({ success: true, data: randomized });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка запуска теста' });
  }
});
router.post('/:testId/submit', auth_1.authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { testId } = req.params;
    const { answers, questionsOrder } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Укажите ответы' });
    }
    const result = await antiCheatService_1.default.submitTestWithAntiCheat(
      userId,
      testId,
      answers,
      questionsOrder || []
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Ошибка' });
  }
});
router.get('/:testId/results', auth_1.authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { testId } = req.params;
    const attempts = await database_1.prisma.testAttempt.findMany({
      where: { userId, testId },
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        score: true,
        startedAt: true,
        completedAt: true,
        suspiciousFlag: true,
      },
    });
    res.json({ success: true, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка получения результатов' });
  }
});
exports.default = router;
//# sourceMappingURL=tests.js.map
