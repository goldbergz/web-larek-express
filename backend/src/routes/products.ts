import { Router } from 'express';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
} from '../controllers/products';
import auth from '../middlewares/auth';
import { validateCreateProduct, validateUpdateProduct } from '../middlewares/validations/product-validation';

const router = Router();

router.get('/', getProducts);
router.post('/', validateCreateProduct, createProduct);
router.patch('/:productId', auth, validateUpdateProduct, updateProduct);
router.delete('/:productId', auth, deleteProduct);

export default router;
