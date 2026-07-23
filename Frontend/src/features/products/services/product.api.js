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

export async function getAllProducts() {
    const response = await productApiInstance.get('/')
    return response.data
}

export async function getProductById(productId) {
    const response = await productApiInstance.get(`/detail/${productId}`)
    return response.data
}

export async function addVariant(productId, formData) {
    const response = await productApiInstance.post(`/${productId}/variants`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
}

export async function updateVariantStock(productId, variantId, data) {
    const response = await productApiInstance.patch(`/${productId}/variants/${variantId}/stock`, data);
    return response.data;
}

export async function deleteVariant(productId, variantId) {
    const response = await productApiInstance.delete(`/${productId}/variants/${variantId}`);
    return response.data;
}