import axios from "axios";

const cartApiInstance = axios.create({
    baseURL: '/api/cart',
    withCredentials: true
})

export const addItem = async ({ productId, variantId }) => {
    const resaponse = await cartApiInstance.post(`/add${productId}/${variantId}`)
    return resaponse.data
}