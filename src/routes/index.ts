import { Router } from 'express';
import example from './example.route';

const router = Router();

router.use('/example', example);

export default router;
