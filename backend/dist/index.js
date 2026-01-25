'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const cors_1 = __importDefault(require('cors'));
const dotenv_1 = __importDefault(require('dotenv'));
const errorHandler_1 = require('./middlewares/errorHandler');
const auth_1 = __importDefault(require('./routes/auth'));
const user_1 = __importDefault(require('./routes/user'));
const students_1 = __importDefault(require('./routes/students'));
const diagnostic_1 = __importDefault(require('./routes/diagnostic'));
const tests_1 = __importDefault(require('./routes/tests'));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use(
  (0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express_1.default.json({ limit: '10mb' })); // Увеличен лимит для загрузки base64 изображений
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Lyceum 64 API is running' });
});
app.use('/api/auth', auth_1.default);
app.use('/api/users', user_1.default);
app.use('/api/students', students_1.default);
app.use('/api/diagnostic', diagnostic_1.default);
app.use('/api/tests', tests_1.default);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API documentation: http://localhost:${PORT}/api`);
});
exports.default = app;
//# sourceMappingURL=index.js.map
