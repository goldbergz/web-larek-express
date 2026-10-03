import { Router } from 'express';
import { createOrder } from '../controllers/order';
import { validateCreateOrder } from '../middlewares/validations/order-validation';

const router = Router();

router.post('/', validateCreateOrder, createOrder);

export default router;
