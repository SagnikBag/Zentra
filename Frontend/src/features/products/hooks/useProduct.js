import { createProduct, getSellerProducts, getAllProducts, getProductById, addVariant, updateVariantStock, deleteVariant } from "../services/product.api";
import { useDispatch } from "react-redux";
import { setSellerProducts, setProducts } from '../state/product.slice'

export const useProduct = () => {

    const dispatch = useDispatch();
    async function handleCreateProduct(formData) {
        const data = await createProduct(formData);
        return data.products
    }
    async function handleGetSellerProduct() {
        const data = await getSellerProducts();
        dispatch(setSellerProducts(data.products));
        return data.products
    }
    async function handleGetAllProducts() {
        const data = await getAllProducts();
        dispatch(setProducts(data.products));
        return data.products
    }
    async function handleGetProductById(productId) {
        const data = await getProductById(productId)
        return data.product
    }

    async function handleAddVariant(productId, formData) {
        const data = await addVariant(productId, formData);
        return data.product;
    }

    async function handleUpdateVariantStock(productId, variantId, stockData) {
        const data = await updateVariantStock(productId, variantId, stockData);
        return data.product;
    }

    async function handleDeleteVariant(productId, variantId) {
        const data = await deleteVariant(productId, variantId);
        return data.product;
    }

    return {
        handleCreateProduct,
        handleGetSellerProduct,
        handleGetAllProducts,
        handleGetProductById,
        handleAddVariant,
        handleUpdateVariantStock,
        handleDeleteVariant
    }
}