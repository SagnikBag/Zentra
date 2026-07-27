import productModel from "../model/product.model";

export const stockVariant = async(productId,variantId) =>{
    const product = await productModel.findOne({
        _id:productId,
        "variants._id": variantId
    })

    const stock = product.variants.find(variant => variant._id.toString() === variantId).stock

    return stock
}