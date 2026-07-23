import productModel from '../model/product.model.js'
import { uploadFile } from '../services/storage.service.js';


export async function createProduct(req,res){

    const {title,description,priceAmount,priceCurrency} = req.body;
     console.log(req.body)
    const seller = req.user;
     
// createProduct

    const images = await Promise.all(req.files.map(async(file)=>{
        return await uploadFile({
            buffer:file.buffer,
            fileName :file.originalname
        })
        console.log("uploaded image", uploaded);
        
    }))
    console.log(req.files);

    const product = await productModel.create({
        title,
        description,
        price:{
            amount:priceAmount,
            currency: priceCurrency || "INR"
        },
        images,
        seller: seller._id
    })
    console.log(product);
    res.status(201).json({
        message:"Product created successfully",
        success:true,
        product
    })

}
export async function getSellerProducts(req,res){
    const seller = req.user


// getSellerProducts

    const products = await productModel.find({seller: seller._id})


    res.status(200).json({
        message:"Products fetched successfully",
        success: true,
        products
    })
}
export async function getAllProducts(req,res){
    const products = await productModel.find()

    return res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}
export async function getProductDetails(req,res){
    const {id} = req.params;

    const product = await productModel.findById(id)

    if(!product){
        return res.status(404).json({
            message:"Product not found",
            success: false
        })
    }

    return res.status(200).json({
        message:"Product details fetched successfully",
        success: true,
        product
    })
}

export async function addVariant(req, res) {
    try {
        const { id } = req.params;
        const { stock, priceAmount, priceCurrency, attributes } = req.body;

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        let images = [];
        if (req.files && req.files.length > 0) {
            images = await Promise.all(req.files.map(async (file) => {
                return await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname
                });
            }));
        }

        let parsedAttributes = attributes;
        if (typeof attributes === 'string') {
            try {
                parsedAttributes = JSON.parse(attributes);
            } catch (e) {
                parsedAttributes = {};
            }
        }

        const newVariant = {
            images: images.length > 0 ? images : [],
            stock: Number(stock) || 0,
            attridutes: parsedAttributes || {},
            price: {
                amount: Number(priceAmount) || 0,
                currency: priceCurrency || "INR"
            }
        };

        if (!product.varient) {
            product.varient = [];
        }
        product.varient.push(newVariant);
        await product.save();

        return res.status(201).json({
            message: "Variant created successfully",
            success: true,
            product
        });
    } catch (error) {
        console.error("Error adding variant:", error);
        return res.status(500).json({ message: error.message || "Failed to add variant", success: false });
    }
}

export async function updateVariantStock(req, res) {
    try {
        const { productId, variantId } = req.params;
        const { stock, priceAmount, priceCurrency } = req.body;

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        const variant = product.varient?.id(variantId) || product.varient?.find(v => v._id?.toString() === variantId);
        if (!variant) {
            return res.status(404).json({ message: "Variant not found", success: false });
        }

        if (stock !== undefined && stock !== null) {
            variant.stock = Number(stock);
        }
        if (priceAmount !== undefined && priceAmount !== null) {
            if (!variant.price) variant.price = {};
            variant.price.amount = Number(priceAmount);
        }
        if (priceCurrency) {
            if (!variant.price) variant.price = {};
            variant.price.currency = priceCurrency;
        }

        await product.save();

        return res.status(200).json({
            message: "Variant stock updated successfully",
            success: true,
            product
        });
    } catch (error) {
        console.error("Error updating variant stock:", error);
        return res.status(500).json({ message: error.message || "Failed to update variant stock", success: false });
    }
}

export async function deleteVariant(req, res) {
    try {
        const { productId, variantId } = req.params;

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        if (product.varient) {
            product.varient = product.varient.filter(v => v._id?.toString() !== variantId);
            await product.save();
        }

        return res.status(200).json({
            message: "Variant deleted successfully",
            success: true,
            product
        });
    } catch (error) {
        console.error("Error deleting variant:", error);
        return res.status(500).json({ message: error.message || "Failed to delete variant", success: false });
    }
}