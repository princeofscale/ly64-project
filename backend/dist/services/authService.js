"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middlewares/errorHandler");
const jwt_1 = require("../utils/jwt");
const emailValidationService_1 = __importDefault(require("./emailValidationService"));
const achievementService_1 = __importDefault(require("./achievementService"));
const SALT_ROUNDS = 10;
class AuthService {
    async generateUsername(email) {
        let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_');
        const generateRandomSuffix = () => {
            return Math.random().toString(36).substring(2, 8);
        };
        let username = `${baseUsername}_${generateRandomSuffix()}`;
        let attempts = 0;
        const maxAttempts = 10;
        while (await database_1.default.user.findUnique({ where: { username } })) {
            username = `${baseUsername}_${generateRandomSuffix()}`;
            attempts++;
            if (attempts >= maxAttempts) {
                username = `${baseUsername}_${Date.now()}`;
                break;
            }
        }
        return username;
    }
    async register(data) {
        const { email, password, name, status, currentGrade, desiredDirection, motivation, agreedToTerms, authProvider, } = data;
        const existingUser = await database_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new errorHandler_1.AppError('Пользователь с таким email уже существует', 409);
        }
        const username = await this.generateUsername(email);
        const isValidEmail = await emailValidationService_1.default.validateEmail(email);
        if (!isValidEmail) {
            throw new errorHandler_1.AppError('Email адрес недоступен или не существует. Проверьте правильность написания.', 400);
        }
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        }
        const user = await database_1.default.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                name,
                status,
                currentGrade,
                desiredDirection,
                motivation,
                agreedToTerms,
                authProvider,
            },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                status: true,
                currentGrade: true,
                desiredDirection: true,
                motivation: true,
                authProvider: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        await database_1.default.userProgress.create({
            data: {
                userId: user.id,
                completedTests: JSON.stringify([]),
                stats: JSON.stringify([]),
            },
        });
        achievementService_1.default
            .checkAndUnlockAchievements(user.id)
            .catch((err) => console.error('Error unlocking achievements:', err));
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
        });
        return {
            user,
            token,
        };
    }
    async login(data) {
        const { email, password } = data;
        const user = await database_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new errorHandler_1.AppError('Неверный email или пароль', 401);
        }
        if (!user.password) {
            throw new errorHandler_1.AppError('Этот аккаунт был создан через внешний сервис. Используйте соответствующий способ входа.', 401);
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new errorHandler_1.AppError('Неверный email или пароль', 401);
        }
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                status: user.status,
                currentGrade: user.currentGrade,
                desiredDirection: user.desiredDirection,
                motivation: user.motivation,
                authProvider: user.authProvider,
                avatar: user.avatar,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            token,
        };
    }
    async getCurrentUser(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                status: true,
                currentGrade: true,
                desiredDirection: true,
                motivation: true,
                authProvider: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
                progress: true,
            },
        });
        if (!user) {
            throw new errorHandler_1.AppError('Пользователь не найден', 404);
        }
        return user;
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
//# sourceMappingURL=authService.js.map