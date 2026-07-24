import { useDispatch } from "react-redux";
import { addItem } from "../service/cart.api";
import { addItem as addToCart } from "../state/cart.slice"

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleAddItem({ productId, variantId }) {
        const data = await addItem({ productId, variantId })

        return data
    }

    return {
        handleAddItem
    }
}