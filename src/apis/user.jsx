import axios from './axios';

export const apiLoginAdmin = (data) => axios({
    url: `/user/login`,
    method: 'post',
    data,
})

export const apiGetCurrent = () => axios({
    url: `/user/current`,
    method: 'get'
})

export const apiUpdateCurrent = (data) => axios({
    url: `/user/current`,
    method: 'put',
    data
})

export const apiGetAlluser = (params) => axios({
    url: `/user`,
    method: 'get',
    params
})

export const apiGetAllEmployee = () => axios({
    url: `/user/manager`,
    method: 'get'
})

export const apiUpdateUser = (data) => axios({
    url: `/user/current`,
    method: 'put',
    data
})

export const apiLogoutAdmin = () => axios({
    url: `/user/logout`,
    method: 'post',
    withCredentials: true
})

export const apiUpdateUserBlockStatus = (data) => axios({
    url: `/user/blockStatus`,
    method: 'put',
    data
})

export const apiCreateEmployee = (data) => axios({
    url: `/user/createManager`,
    method: 'post',
    data
})

export const apiUpdateEmployee = (employeeId, data) => axios({
    url: `/user/updateManager/${employeeId}`,
    method: 'put',
    data
})

export const apiGetEmployee = (employeeId) => axios({
    url: `/user/manager/${employeeId}`,
    method: 'get',
})


