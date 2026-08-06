import axios from "axios";

const cartApiInstance = axios.create({
    baseURL: '/api/cart',
    withCredentials: true
})

export const addItem = async ({ productId, variantsId, quantity }) => {
    const response = await cartApiInstance.post(`/add/${productId}/${variantsId}`, {
        quantity: 1
    })

    console.log(response);

    return response.data

}

export const getCart = async () => {
    const response = await cartApiInstance.get('/')

    return response.data
}

export const incrementCartItemApi = async ({ productId, variantsId }) => {
    const response = await cartApiInstance.patch('/quantity/increment/${productId}/${variantsId}')
    return response.data
}
export const createCartOrder = async () => {
    const response = await cartApiInstance.post("/payment/create/order")

    return response.data
}
