import axios from './axios';

export const apiGetAllImportReceipts = (params) => axios({
    url: '/importReceipt',
    method: 'get',
    params
});

export const apiGetImportReceipt = (importReceiptId) => axios({
    url: `/importReceipt/${importReceiptId}`,
    method: 'get',
});

export const apiCreateImportReceipt = (data) => axios({
    url: '/importReceipt',
    method: 'post',
    data
});

export const apiUpdateImportReceipt = (importReceiptId, data) => axios({
    url: `/importReceipt/${importReceiptId}`,
    method: 'put',
    data
});

export const apiApproveImportReceipt = (importReceiptId) => axios({
    url: `/importReceipt/${importReceiptId}/approve`,
    method: 'put',
});

export const apiCancelImportReceipt = (importReceiptId) => axios({
    url: `/importReceipt/${importReceiptId}/cancel`,
    method: 'put',
});