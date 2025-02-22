// backend/src/routes/productRoutes.ts
import express from 'express';
import { 
  createProduct, 
  getAllProducts, 
  getMerchantProducts, 
  updateProduct, 
  deleteProduct, 
  getProduct
} from '../controllers/ProductController';


const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProduct)
router.get('/merchant/:merchantAddress', getMerchantProducts);

// Protected routes (require authentication)
// router.get('/my-products', getMerchantProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;