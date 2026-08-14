import cartModel from "../model/cart.model.js";
import productModel from "../model/product.model.js";
import { stockVariant } from "../dao/product.dao.js";
import mongoose from "mongoose";
import { createOrder } from "../services/payment.service.js";
import { getCartDetails } from "../dao/cart.dao.js";
import paymentModel from "../model/payment.model.js";
import {validatePaymentVerification} from "razorpay/dist/utils/razorpay-utils.js"



export const addToCart = async(req,res)=>{

      console.log(req.params);

    const {productId,variantId} = req.params;
    const {quantity = 1} = req.body;

   
    

    const product = await productModel.findOne({
        _id:productId,
        "variants._id" : variantId
       


    })
     

    if(!product){
        return res.status(404).json({
            message:"product or variant not found",
            success:false
        })
    }

    const stock = await stockVariant(productId,variantId)

    const cart = (await cartModel.findOne({user: req.user._id})) || (await cartModel.create(
        {user:req.user._id, items: []}
    ))


    const isProductAlreadyCart = cart.items.some(item => item.product.toString() === productId && 
    (item.variants?.toString() === variantId || item.variant?.toString() === variantId))

    if(isProductAlreadyCart){
         const cartItem = cart.items.find(item => item.product.toString() === productId && (item.variants?.toString() === variantId || item.variant?.toString() === variantId))
         const quantityInCart = cartItem ? cartItem.quantity : 0
    
          if (quantityInCart + quantity > stock) {
            return res.status(400).json({
                message: `Only ${stock} items left in stock. and you already have ${quantityInCart} items in your cart`,
                success: false
            })
        }
        await cartModel.findOneAndUpdate(
            {
                user: req.user._id,
                "items.product": productId,
                $or: [{ "items.variants": variantId }, { "items.variant": variantId }]
            },
            {$inc:{"items.$.quantity":quantity}},
            {new:true}
        )

        return res.status(200).json({
            message:"cart updated successfully",
            success: true
        })
    }
    if(quantity> stock){
        return res.status(400).json({
            message:`Only ${stock} items left in stock`,
            success: false
        })
    }

    const variant = product.variants.id(variantId);

if (!variant) {
    return res.status(404).json({
        message: "Variant not found",
        success: false
    });
}

    cart.items.push({
        product: productId,
        variants: variantId,
        quantity,
        price:variant.price
    })

    await cart.save()

    return res.status(200).json({
        message:"Product added successfully",
        success:true
    })
}
export const getCart = async(req,res)=>{

    const user = req.user

    let cart = await getCartDetails(user._id)


    if(!cart){
        cart = (await cartModel.findOne({user:user._id})) || (await cartModel.create({user:user._id, items: []}))
    }

    return res.status(200).json({
        message:'Cart fetched successfully',
        success: true,
        cart
    })
}
export const incrementCartItemQuantity = async(req,res)=>{
    const {productId,variantId} = req.params

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    })

    if(!product){
        return res.status(404).json({
            message: "Product or variant not found",
            success: false
        })
    }

    const cart = await cartModel.findOne({user: req.user._id})

    if(!cart){
        return res.status(404).json({
            message:"Cart not found",
            success: false
        })
    }

    const stock = await stockVariant(productId,variantId)

    const itemQuantityInCart = cart.items.find(item=> item.product.toString() === productId && (item.variants?.toString() === variantId || item.variant?.toString() === variantId))?.quantity || 0

    if (itemQuantityInCart + 1 > stock){
        return res.status(400).json({
            message: `Only ${stock} items left in stock. and you already have ${itemQuantityInCart} items in your cart `,
            success: false
        })
    }

    await cartModel.findOneAndUpdate(
        {
            user: req.user._id,
            'items.product': productId,
            $or: [{ "items.variants": variantId }, { "items.variant": variantId }]
        },
        {$inc:{"items.$.quantity": 1}},
        {new: true}
    )

    return res.status(200).json({
        message:"cart item quantity incremented successfully",
        success: true
    })
}
export const createOrderController = async(req,res)=>{

  const cart = await getCartDetails(req.user._id) 

  console.log(JSON.stringify(cart, null, 2));

  if(!cart){
    return res.status(404).json({
      message: "Cart is empty",
      success: false
    })
  }

  const order = await createOrder ({amount: cart.totalPrice, currency: cart.currency})

  const payment = await paymentModel.create({
    user: req.user._id,
    razorpay:{
        orderId: order.id
    },
    price:{
        amount: cart.totalPrice,
        currency: cart.currency
    },

    orderItems: cart.items.map(item =>({

       
        title: item.product.title,
        productId: item.product._id,
        variantId: item.variant,
        quantity: item.quantity,
        images: item.product.images,
        description: item.product.description,
        price: {
            
            amount: item.price.amount,
            currency: item.price.currency
        }
    }))
  })

  return res.status(200).json({
    message: "Order created siccessfully",
    success: true,
    order
  })
}
export const verifyOrderController = async(req,res)=>{
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body

    const payment = await paymentModel.findOne({
        "razorpay.orderId": razorpay_order_id,
        status: "pending"

    })
    if(!payment){
        return res.status(404).json({
            message: "Payment not found",
            success: false
        })
    }

    const isPaymentValid = validatePaymentVerification({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
    },
    razorpay_signature,config.RAZORPAY_TEST_KEY_SECRET)

    if(!isPaymentValid){
        payment.status = "failed"
        await payment.save()

        return res.status(400).json({
            message:" payment verification failed",
            success: false
        })
    }

    payment.status = "paid"

    payment.razorpay.paymentId = razorpay_payment_id,
    payment.razorpay.signature = razorpay_signature

    await payment.save()

    return res.status(200).json({
        message: "Payment verified successfully",
        success: true
    })
}