import axios from './axios';

export const apiGetAllExportReceipts = (params) => axios({
    url: '/exportReceipt',
    method: 'get',
    params
});

export const apiGetExportReceipt = (exportReceiptId) => axios({
    url: `/exportReceipt/${exportReceiptId}`,
    method: 'get',
});

export const apiCreateExportReceipt = (data) => axios({
    url: '/exportReceipt',
    method: 'post',
    data
});

export const apiUpdateExportReceipt = (exportReceiptId, data) => axios({
    url: `/exportReceipt/${exportReceiptId}`,
    method: 'put',
    data
});

export const apiApproveExportReceipt = (exportReceiptId) => axios({
    url: `/exportReceipt/${exportReceiptId}/approve`,
    method: 'put',
});

export const apiCancelExportReceipt = (exportReceiptId) => axios({
    url: `/exportReceipt/${exportReceiptId}/cancel`,
    method: 'put',
});