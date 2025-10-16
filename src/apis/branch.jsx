import axios from './axios';

export const apiGetAllBranches = (params) => axios({
    url: '/branch',
    method: 'get',
    params
});

export const apiGetBranch = (brandId) => axios({
    url: `/branch/${brandId}`,
    method: 'get',
});

export const apiUpdateBranchVisibility = (brandId, data) => axios({
    url: `/branch/${brandId}/visibility`,
    method: 'put',
    data
});

export const apiUpdateBranch = (brandId, data) => axios({
    url: `/branch/${brandId}`,
    method: 'put',
    data
});

export const apiCreateBranch = (data) => axios({
    url: '/branch',
    method: 'post',
    data
});