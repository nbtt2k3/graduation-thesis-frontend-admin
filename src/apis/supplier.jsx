import axios from './axios';

export const apiGetAllSuppliers = (params) => axios({
    url: '/supplier',
    method: 'get',
    params
});

export const apiGetSupplier = (supplierId) => axios({
    url: `/supplier/${supplierId}`,
    method: 'get',
});

export const apiUpdateSupplierVisibility = (supplierId, data) => axios({
    url: `/supplier/${supplierId}/visibility`,
    method: 'put',
    data
});

export const apiUpdateSupplier = (supplierId, data) => axios({
    url: `/supplier/${supplierId}`,
    method: 'put',
    data
});

export const apiCreateSupplier = (data) => axios({
    url: '/supplier',
    method: 'post',
    data
});