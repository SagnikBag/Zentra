import { createProduct, getSellerProducts } from "../services/product.api";
import { useDispatch } from "react-redux";
import { setSellerProducts } from '../state/product.slice'
export const userProduct = () => {
    const dispatch = useDispatch();
    async function handleCreateProduct(formData) {
        const data = await createProduct(formData);
        return data.products
    }
    async function handleGetSellerProduct() {
        const data = await getSellerProducts();
        dispatch(setSellerProducts(data.product));
        return data.products
    }
    return {
        handleCreateProduct,
        handleGetSellerProduct
    }
}