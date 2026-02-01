'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AppError = exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  console.error(`Error: ${message}`, err);
  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
exports.errorHandler = errorHandler;
class AppError extends Error {
  constructor(message, statusCode = 500, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
exports.AppError = AppError;
//# sourceMappingURL=errorHandler.js.map
