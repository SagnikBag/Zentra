import cartModel from "../model/cart.model.js";
import productModel from "../model/product.model.js";
import { stockVariant } from "../dao/product.dao.js";



export const addToCart = async(req,res)=>{

    const {productId,varianId} = req.params;

    const product = await productModel.findById({
        _id:productId,
        "variants._id" : variantId
    })

    if(!product){
        res.status(404).json({
            message:"product or variant not found",
            success:false
        })
    }

    const stock = await stockVariant(productId,varianId)

    const cart = (await cartModel.findOne({user: req.user._id})) || (await cartModel.create({user:
        req.user._id
    }))


    const isProductAlreadyCart = cart.items.some(item => item.product.toString() === productId && 
    item.variant?.toString() === variantId)

    if(isProductAlreadyCart){
         const quantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId).quantity
    
          if (quantityInCart + quantity > stock) {
            return res.status(400).json({
                message: `Only ${stock} items left in stock. and you already have ${quantityInCart} items in your cart`,
                success: false
            })
        }
        await cartModel.findOneAndUpdate(
            {user: req.user._id,"items.product": productId, "items.variant":variantId},
            {$inc:{"items.quantity":quantity}},
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
            success: true
        })
    }

    cart.item.push({
        product: productId,
        variant:varianId,
        quantity,
        price:product.price
    })

    await cart.save()

    return res.status(200).json({
        message:"Product added successfully",
        success:true
    })
}
export const getCart = async(req,res)=>{

    const user = req.user

    let cart = await cartModel.findOne({user:user._id}).populate("items.product")

    if(!cart){
        cart = await cartModel.create({user:user._id})
    }

    return res.status(200).json({
        message:'Cart fetched successfully',
        success: true,
        cart
    })
}