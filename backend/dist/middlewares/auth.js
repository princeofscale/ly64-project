'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jwt_1 = require('../utils/jwt');
const errorHandler_1 = require('./errorHandler');
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      throw new errorHandler_1.AppError('Токен не предоставлен', 401);
    }
    const decoded = (0, jwt_1.verifyToken)(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(error);
  }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      const decoded = (0, jwt_1.verifyToken)(token);
      req.userId = decoded.userId;
    }
    next();
  } catch (error) {
    next();
  }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map
