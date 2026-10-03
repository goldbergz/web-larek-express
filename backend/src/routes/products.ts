import { Router } from 'express';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
} from '../controllers/products';
import auth from '../middlewares/auth';
import { validateCreateProduct, validateUpdateProduct, validateDeleteProduct } from '../middlewares/validations/product-validation';

const router = Router();

router.get('/', getProducts);
router.post('/', auth, validateCreateProduct, createProduct);
router.patch('/:productId', auth, validateUpdateProduct, updateProduct);
router.delete('/:productId', auth, validateDeleteProduct, deleteProduct);

export default router;
