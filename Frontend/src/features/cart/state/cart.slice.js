import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        totalPrice: null,
        currency: null,
        items: []
    },
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload,
                state.totalPrice = action.payload.totalPrice;
            state.currency = action.payload.currency;

        },
        updateQuantity: (state, action) => {
            const { itemId, quantity } = action.payload;
            const item = state.items.find(i => i._id === itemId);
            if (item) {
                item.quantity = Math.max(1, quantity);
            }
        },
        removeItem: (state, action) => {
            const itemId = action.payload;
            state.items = state.items.filter(i => i._id !== itemId);
        },
        clearCart: (state) => {
            state.items = [];
        },
        incrementCartItem: (state, action) => {
            const { productId, variantsId } = action.payload

            state.items = state.items.map(item => {
                if (item.productId === productId && item.variantsId === variantsId) {
                    return { ...item, quantity: item.quantity + 1 }
                } else {
                    return item
                }
            })
        }
    },
})

export const { setItems, addItem, updateQuantity, removeItem, clearCart, incrementCartItem } = cartSlice.actions
export default cartSlice.reducer