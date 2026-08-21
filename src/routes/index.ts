import { Router } from 'express';
import auth from './auth.route';
import category from './category.route';
import location from './location.route';
import product from './product.route';

const router = Router();

router.use('/auth', auth);
router.use('/categories', category);
router.use('/locations', location);
router.use('/products', product);

export default router;
