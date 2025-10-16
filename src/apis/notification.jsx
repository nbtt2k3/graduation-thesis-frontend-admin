import axios from './axios';

export const apiGetAllNotifications = (params) => axios({
    url: '/notification',
    method: 'get',
    params
});

export const apiUpdateNotificationReadStatus = (notificationId) => axios({
    url: `/notification/${notificationId}`,
    method: 'put'
});
