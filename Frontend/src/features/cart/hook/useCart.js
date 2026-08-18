import { useDispatch } from "react-redux";
import { addItem, createCartOrder, getCart, incrementCartItemApi } from "../service/cart.api";
import { setItems, updateQuantity, removeItem, clearCart, incrementCartItem } from "../state/cart.slice";

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleAddItem({ productId, variantId, quantity }) {
        const data = await addItem({ productId, variantId, quantity });
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
    async function handleCreateCartOrder() {
        const data = await createCartOrder();




        return data.order
    }
    async function handleVerifyCartOrder({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
        const data = await verifycartOrder({ razorpay_order_id, razorpay_payment_id, razorpay_signature })
        return data.success
    }

    return {
        handleAddItem,
        handleGetCart,
        handleUpdateQuantity,
        handleRemoveItem,
        handleClearCart,
        handleIncrementCartItem,
        handleCreateCartOrder, handleVerifyCartOrder
    };
};