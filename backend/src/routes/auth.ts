import { Router } from 'express';
import {
  register, login, refreshAccessToken, logout, getCurrentUser,
} from '../controllers/auth';
import auth from '../middlewares/auth';
import { validateRegister, validateLogin } from '../middlewares/validations/auth-validation';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', auth, getCurrentUser);

export default router;
