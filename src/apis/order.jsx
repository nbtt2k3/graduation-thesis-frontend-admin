import axios from './axios';

export const apiGetAllOrders = (params) => axios({
    url: '/order',
    method: 'get',
    params
});

export const apiGetOrder = (orderId) => axios({
    url: `/order/${orderId}`,
    method: 'get',
});

export const apiUpdateOrderStatusByAdmin = (orderId, data) => axios({
    url: `/order/updateStatus/${orderId}`,
    method: 'put',
    data
});

export const apiCancelOrderByUser = (orderId, data) => axios({
    url: `/order/cancelOrder/${orderId}`,
    method: 'put',
    data
});