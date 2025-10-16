import axios from './axios';

export const apiGetAllDiscounts = (params) => axios({
    url: '/discount',
    method: 'get',
    params
});

export const apiGetDiscountById = (discountId) => axios({
    url: `/discount/${discountId}`,
    method: 'get',
});

export const apiUpdateDiscountVisibility = (discountId, data) => axios({
    url: `/discount/${discountId}/visibility`,
    method: 'put',
    data
});

export const apiUpdateDiscount = (discountId, data) => axios({
    url: `/discount/${discountId}`,
    method: 'put',
    data
});

export const apiCreateDiscount = (data) => axios({
    url: '/discount',
    method: 'post',
    data
});
