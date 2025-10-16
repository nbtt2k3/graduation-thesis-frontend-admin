import axios from './axios';

export const apiGetAllVouchers = (params) => axios({
    url: '/voucher',
    method: 'get',
    params
});

export const apiGetVoucher = (voucherId) => axios({
    url: `/voucher/${voucherId}`,
    method: 'get',
});

export const apiUpdateVoucherVisibility = (voucherId, data) => axios({
    url: `/voucher/${voucherId}/visibility`,
    method: 'put',
    data
});

export const apiUpdateVoucher = (voucherId, data) => axios({
    url: `/voucher/${voucherId}`,
    method: 'put',
    data
});

export const apiCreateVoucher = (data) => axios({
    url: '/voucher',
    method: 'post',
    data
});
