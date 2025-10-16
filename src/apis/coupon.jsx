import axios from './axios';

export const apiGetAllCoupons = (params) => axios({
    url: '/coupon',
    method: 'get',
    params
});

export const apiGetCoupon = (couponId) => axios({
    url: `/coupon/${couponId}`,
    method: 'get',
});

export const apiUpdateCouponVisibility = (couponId, data) => axios({
    url: `/coupon/${couponId}/visibility`,
    method: 'put',
    data
});

export const apiUpdateCoupon = (couponId, data) => axios({
    url: `/coupon/${couponId}`,
    method: 'put',
    data
});

export const apiCreateCoupon = (data) => axios({
    url: '/coupon',
    method: 'post',
    data
});
