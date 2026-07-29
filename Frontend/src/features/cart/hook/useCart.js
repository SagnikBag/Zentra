import { useDispatch } from "react-redux";
import { addItem, getCart } from "../service/cart.api";
import { addItem as addToCart } from "../state/cart.slice";
import { setItems } from "../state/cart.slice";

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleAddItem({ productId, variantId, quantity }) {
        const data = await addItem({ productId, variantId, quantity })
        return data
    }

    async function handleGetCart() {
        const data = await getCart();

        console.log("GET CART RESPONSE:", data);
        dispatch(setItems(data.cart.items));


    }

    return {
        handleAddItem, handleGetCart
    }
}