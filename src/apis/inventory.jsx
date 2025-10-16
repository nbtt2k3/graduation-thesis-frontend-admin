import axios from './axios';

export const apiGetAllInventories = (params) => axios({
    url: '/inventory',
    method: 'get',
    params
});

export const apiGetInventory = (inventoryId) => axios({
    url: `/inventory/${inventoryId}`,
    method: 'get'
});

export const apiGetInventoryTransaction = (inventoryId) => axios({
    url: `/inventory/${inventoryId}/transactions`,
    method: 'get'
});
