import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/authenticate.middleware';
import { RegisterSchema, LoginSchema } from '../validations/auth.validation';
import { register, login, getMe } from '../controllers/auth.controller';

const router = Router();

router.post('/register', validate(RegisterSchema), register);
router.post('/login', validate(LoginSchema), login);
router.get('/me', authenticate, getMe);

export default router;
