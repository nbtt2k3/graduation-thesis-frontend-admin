import axios from './axios';

export const apiGetAllCategories = (params) => axios({
    url: '/category',
    method: 'get',
    params
});

export const apiGetCategory = (categoryId) => axios({
    url: `/category/${categoryId}`,
    method: 'get',
});

export const apiUpdateCategoryVisibility = (categoryId, data) => axios({
    url: `/category/${categoryId}/visibility`,
    method: 'put',
    data
});

export const apiUpdateCategory = (categoryId, data) => axios({
    url: `/category/${categoryId}`,
    method: 'put',
    data
});

export const apiCreateCategory = (data) => axios({
    url: '/category',
    method: 'post',
    data
});