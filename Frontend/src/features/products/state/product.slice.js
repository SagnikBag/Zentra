import { createSlice } from "@reduxjs/toolkit"
const productSlice = createSlice({
    name: "product",
    initialState: {
        sellerProduct: []
    },
    reducers: {
        setSellerProducts(state, action) {
            state.sellerProduct = action.payload
        }
    }
})

export const { setSellerProducts } = productSlice.actions
export default productSlice.reducer