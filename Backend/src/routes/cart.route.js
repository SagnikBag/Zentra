import express from 'express';
import { authenticateSeller, authenticateUser } from '../middleware/auth.middleware.js';
import cartModel from '../model/cart.model.js';
import { validateAddToCart, validateIncrementCartitemQuantity } from '../validator/cart.validator.js';
import { addToCart, getCart,incrementCartItemQuantity,createOrderController } from '../controllers/cart.controller.js';

const router = express.Router();


router.post('/add/:productId/:variantId',authenticateUser,validateAddToCart,addToCart);


router.get('/',authenticateUser,getCart);

router.patch('/quantity/increment/:productId/:variantId',authenticateSeller,
    validateIncrementCartitemQuantity,incrementCartItemQuantity)

router.post("/payment/create/order",authenticateUser,createOrderController)    

export default router