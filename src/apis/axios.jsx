import axios from "axios";
import { jwtDecode } from "jwt-decode";

const baseURL = import.meta.env.VITE_APP_API_URI + "/api/v1";

const instance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {},
});

instance.interceptors.request.use(
  async function (config) {
    let localStorageData = localStorage.getItem("TechZone/admin")
      ? JSON.parse(localStorage.getItem("TechZone/admin"))
      : null;

    const token = localStorageData?.token;

    if (token) {
      const decoded = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      const userRole = decoded?.role || decoded?.userRole;
      if (userRole !== "admin") {
        console.warn("User không có quyền admin — tự động đăng xuất.");
        localStorage.removeItem("TechZone/admin");
        window.location.href = "/login";
        return Promise.reject(new Error("Permission denied"));
      }

      if (!isExpired) {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      }

      try {
        const response = await axios.post(
          `${baseURL}/user/refreshAccessToken`,
          {},
          { withCredentials: true }
        );

        if (response.data?.newAccessToken || response?.newAccessToken) {
          localStorageData.token =
            response.data.newAccessToken || response.newAccessToken;
          localStorage.setItem(
            "TechZone/admin",
            JSON.stringify(localStorageData)
          );
          config.headers.Authorization = `Bearer ${
            response.data.newAccessToken || response.newAccessToken
          }`;
        }
      } catch (error) {
        localStorage.removeItem("TechZone/admin");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      localStorage.removeItem("TechZone/admin");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default instance;
