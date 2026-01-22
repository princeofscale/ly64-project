import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();


router.post('/register', authController.register.bind(authController));


router.post('/login', authController.login.bind(authController));


router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));


router.post('/logout', authenticateToken, authController.logout.bind(authController));

export default router;
