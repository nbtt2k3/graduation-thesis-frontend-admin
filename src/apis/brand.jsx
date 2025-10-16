import axios from './axios';

export const apiGetAllBrands = (params) => axios({
    url: '/brand',
    method: 'get',
    params
});

export const apiGetBrand = (brandId) => axios({
    url: `/brand/${brandId}`,
    method: 'get',
});

export const apiUpdateBrandVisibility = (brandId, data) => axios({
    url: `/brand/${brandId}/visibility`,
    method: 'put',
    data
});

export const apiUpdateBrand = (brandId, data) => axios({
    url: `/brand/${brandId}`,
    method: 'put',
    data
});

export const apiCreateBrand = (data) => axios({
    url: '/brand',
    method: 'post',
    data
});