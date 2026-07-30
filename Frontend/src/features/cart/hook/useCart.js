import { useDispatch } from "react-redux";
import { addItem, getCart, incrementCartItemApi } from "../service/cart.api";
import { setItems, updateQuantity, removeItem, clearCart, incrementCartItem } from "../state/cart.slice";

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleAddItem({ productId, variantsId, quantity }) {
        const data = await addItem({ productId, variantsId, quantity });
        return data;
    }

    async function handleGetCart() {
        try {
            const data = await getCart();
            console.log("GET CART RESPONSE:", data);
            if (data?.cart?.items) {
                dispatch(setItems(data.cart.items));
            }
            return data;
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    }

    async function handleUpdateQuantity(itemId, newQty) {
        if (newQty < 1) return;
        dispatch(updateQuantity({ itemId, quantity: newQty }));
    }

    async function handleRemoveItem(itemId) {
        dispatch(removeItem(itemId));
    }

    async function handleClearCart() {
        dispatch(clearCart());
    }
    async function handleIncrementCartItem({ productId, variantsId }) {
        const data = await incrementCartItemApi({ productId, variantsId })

        dispatch(incrementCartItem({ productId, variantsId }))
    }

    return {
        handleAddItem,
        handleGetCart,
        handleUpdateQuantity,
        handleRemoveItem,
        handleClearCart,
        handleIncrementCartItem
    };
};