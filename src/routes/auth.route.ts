import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { RegisterSchema, LoginSchema } from '../validations/auth.validation';
import { register, login } from '../controllers/auth.controller';

const router = Router();

router.post('/register', validate(RegisterSchema), register);
router.post('/login', validate(LoginSchema), login);

export default router;