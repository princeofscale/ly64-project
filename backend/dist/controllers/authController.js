'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthController = void 0;
const authService_1 = __importDefault(require('../services/authService'));
const validation_1 = require('../utils/validation');
const errorHandler_1 = require('../middlewares/errorHandler');
class AuthController {
  async register(req, res, next) {
    try {
      const validatedData = validation_1.registerSchema.parse(req.body);
      const result = await authService_1.default.register(validatedData);
      res.status(201).json({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  async login(req, res, next) {
    try {
      const validatedData = validation_1.loginSchema.parse(req.body);
      const result = await authService_1.default.login(validatedData);
      res.status(200).json({
        success: true,
        message: 'Вход выполнен успешно',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  async getCurrentUser(req, res, next) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new errorHandler_1.AppError('Не авторизован', 401);
      }
      const user = await authService_1.default.getCurrentUser(userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
  async logout(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        message: 'Выход выполнен успешно',
      });
    } catch (error) {
      next(error);
    }
  }
}
exports.AuthController = AuthController;
exports.default = new AuthController();
//# sourceMappingURL=authController.js.map
