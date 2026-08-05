import { Router } from 'express';

const router = Router();

router.use('/auth', require('./auth.route').default);

export default router;