import express from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import cartModel from '../model/cart.model.js';
import { validateAddToCart } from '../validator/cart.validator.js';
import { getCart } from '../controllers/cart.controller.js';

const router = express.Router();



router.post('/:productId/:variantId',authenticateUser,validateAddToCart);

router.get('/',authenticateUser,getCart)

export default router