import axios from "axios";

const productApiInstance = axios.create({
    baseURL: "/api/products",
    withCredentials: true
})

// create function for adding a new product
export async function createProduct(formData) {
    const response = await productApiInstance.post("/", formData)
    return response.data
}


// function to get all products
export async function getSellerProducts() {
    const response = await productApiInstance.get('/seller')
    return response.data
}