"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const diagnosticService_1 = __importDefault(require("../services/diagnosticService"));
const router = (0, express_1.Router)();
router.get('/subjects', auth_1.authenticateToken, async (req, res) => {
    try {
        const direction = req.query.direction;
        const subjects = diagnosticService_1.default.getSubjectsForUser(direction);
        res.json({ success: true, data: subjects });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка получения предметов' });
    }
});
router.get('/results', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const results = await diagnosticService_1.default.getUserDiagnosticResults(userId);
        res.json({ success: true, data: results });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка получения результатов' });
    }
});
router.post('/submit', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject, score, details } = req.body;
        if (!subject || score === undefined) {
            return res.status(400).json({ success: false, message: 'Укажите предмет и баллы' });
        }
        const result = await diagnosticService_1.default.saveDiagnosticResult(userId, subject, score, details);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сохранения результата' });
    }
});
router.get('/status', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const direction = req.query.direction;
        const completed = await diagnosticService_1.default.checkDiagnosticCompleted(userId, direction);
        const results = await diagnosticService_1.default.getUserDiagnosticResults(userId);
        res.json({
            success: true,
            data: {
                completed,
                results,
                subjects: diagnosticService_1.default.getSubjectsForUser(direction),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка проверки статуса' });
    }
});
router.post('/plan/generate', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { direction } = req.body;
        const plan = await diagnosticService_1.default.generateLearningPlan(userId, direction);
        res.json({ success: true, data: plan });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка генерации плана' });
    }
});
router.get('/plan', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const plan = await diagnosticService_1.default.getLearningPlan(userId);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'План не найден' });
        }
        res.json({ success: true, data: plan });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка получения плана' });
    }
});
router.post('/plan/complete-topic', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.body;
        if (!itemId) {
            return res.status(400).json({ success: false, message: 'Укажите ID темы' });
        }
        const plan = await diagnosticService_1.default.markTopicCompleted(userId, itemId);
        res.json({ success: true, data: plan });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Ошибка' });
    }
});
exports.default = router;
//# sourceMappingURL=diagnostic.js.map