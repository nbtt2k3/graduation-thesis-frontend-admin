import axios from './axios';

export const apiCreateProduct = (data) => axios({
    url: '/product',
    method: 'post',
    data
});

export const apiCreateProductItem = (data, productId) => axios({
    url: `/product/productItem/${productId}`,
    method: 'post',
    data
});

export const apiUpdateProduct = (productId, data) => axios({
    url: `/product/${productId}`,
    method: 'put',
    data
});

export const apiGetProductById = (productId) => axios({
    url: `/product/${productId}`,
    method: 'get',
});

export const apiGetAllProducts = (params) => axios({
    url: `/product`,
    method: 'get',
    params
});

export const apiGetAllProductItems = (params) => axios({
    url: `/product/productItem`,
    method: 'get',
    params
});

export const apiUpdateProductVisibility = (productId, data) => axios({
    url: `/product/${productId}/visibility`,
    method: 'put',
    data
});

export const updateProductItemStatus = (productItemId, data) => axios({
    url: `/product/productItem/${productItemId}/status`,
    method: 'put',
    data
});

export const apiGetPopularProducts = (params) => axios({
    url: `/product/popular`,
    method: 'get',
    params
});



