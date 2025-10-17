import axios from "axios";
import { jwtDecode } from "jwt-decode";

const baseURL = import.meta.env.VITE_APP_API_URI + "/api/v1";

const instance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {},
});

// Biến cờ để tránh nhiều yêu cầu cùng lúc cố gắng làm mới token
let isRefreshing = false;
let failedQueue = [];

// Hàm xử lý các yêu cầu đang chờ sau khi refresh thành công/thất bại
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

instance.interceptors.request.use(
  async function (config) {
    let localStorageData = localStorage.getItem("TechZone/admin")
      ? JSON.parse(localStorage.getItem("TechZone/admin"))
      : null;

    let token = localStorageData?.token; // Sẽ dùng let để có thể gán lại

    // Không có token, bỏ qua
    if (!token) {
      return config;
    }

    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    const userRole = decoded?.role || decoded?.userRole;

    // Kiểm tra quyền (nên đặt trước kiểm tra hết hạn)
    if (userRole !== "admin") {
      console.warn("User không có quyền admin — tự động đăng xuất.");
      localStorage.removeItem("TechZone/admin");
      window.location.href = "/login";
      return Promise.reject(new Error("Permission denied"));
    }

    // Nếu token chưa hết hạn, sử dụng token hiện tại
    if (!isExpired) {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }

    // --- Xử lý Refresh Token (Token đã hết hạn) ---

    // Nếu đang trong quá trình refresh, thêm yêu cầu vào hàng đợi
    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then((refreshedToken) => {
          // Sau khi refresh xong, gán token mới và tiếp tục
          config.headers.Authorization = "Bearer " + refreshedToken;
          return config;
        })
        .catch((err) => {
          // Refresh thất bại, từ chối yêu cầu
          return Promise.reject(err);
        });
    }

    // Đánh dấu bắt đầu quá trình refresh
    isRefreshing = true;

    // Tạo Promise để xử lý yêu cầu gốc sau khi refresh
    const originalRequest = config;

    try {
      const response = await axios.post(
        `${baseURL}/user/refreshAccessToken`,
        {},
        { withCredentials: true }
      );

      const newAccessToken =
        response.data?.newAccessToken || response?.newAccessToken;

      if (newAccessToken) {
        // 1. Cập nhật localStorage
        localStorageData.token = newAccessToken;
        localStorage.setItem(
          "TechZone/admin",
          JSON.stringify(localStorageData)
        );

        // 2. CẬP NHẬT HEADER CỦA YÊU CẦU GỐC!
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 3. Xử lý hàng đợi: Thông báo cho tất cả các yêu cầu đang chờ
        processQueue(null, newAccessToken);

        // 4. Trả về cấu hình yêu cầu gốc đã được cập nhật
        return originalRequest;
      }

      // Nếu API không trả về token mới, coi như thất bại
      throw new Error("Không nhận được access token mới.");
    } catch (error) {
      console.error("Refresh token failed:", error);
      // Xử lý hàng đợi: Thông báo lỗi cho tất cả các yêu cầu đang chờ
      processQueue(error);

      // Đăng xuất và từ chối yêu cầu
      localStorage.removeItem("TechZone/admin");
      window.location.href = "/login";
      return Promise.reject(error);
    } finally {
      // Kết thúc quá trình refresh (quan trọng!)
      isRefreshing = false;
    }
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Interceptor response vẫn giữ nguyên logic đăng xuất khi gặp 401/403
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Chỉ xử lý 401/403 khi KHÔNG phải do lỗi refresh token.
    // Nếu lỗi 401/403 xảy ra sau khi đã refresh (hoặc khi refresh token cũng đã hết hạn),
    // thì vẫn cần đăng xuất.
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      localStorage.removeItem("TechZone/admin");
      window.location.href = "/login";
    }
    // Trả về error.response?.data để các component có thể bắt lỗi cụ thể
    return Promise.reject(error.response?.data || error);
  }
);

export default instance;
