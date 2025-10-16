import React, { createContext, useState, useEffect } from "react";
import * as apis from "../apis";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

export const AdminTechZoneContext = createContext();

const socket = io(import.meta.env.VITE_APP_API_URI, {
  transports: ["websocket"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const AdminTechZoneProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem("TechZone/admin")
  );
  const [userInfor, setUserInfor] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [error, setError] = useState({ hasError: false, message: "" });

  const navigate = useNavigate();

  // format time cho notification
  const formatTime = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInSeconds = Math.floor((now - created) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  //////////////////////////////////
  // Lấy Thông tin hồ sơ người dùng
  //////////////////////////////////
  const fetchUser = async () => {
    try {
      setIsLoadingUser(true);
      setError({ hasError: false, message: "" });
      const response = await apis.apiGetCurrent();
      if (response.success) {
        setUserInfor(response.userInfo);
      }
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải thông tin người dùng");
      } else {
        setError({ hasError: true, message: "Lỗi kết nối API" });
      }
    } finally {
      setIsLoadingUser(false);
    }
  };

  ///////////////////////////
  // Lấy Thông tin thông báo
  ///////////////////////////
  const fetchNotifications = async () => {
    if (!authToken) {
      setNotifications([]);
      return;
    }

    try {
      setIsLoadingNotifications(true);
      setError({ hasError: false, message: "" });
      const response = await apis.apiGetAllNotifications({ limit: 0 });
      if (response.success) {
        const formattedNotifications = response.notificationList.map(
          (notification) => ({
            id: notification._id,
            type: notification.type,
            title: notification.type === "order" ? "Đơn hàng mới" : "Thông báo",
            message: notification.message,
            count: 1,
            time: formatTime(notification.createdAt),
            isRead: notification.isRead,
            event: notification.event,
          })
        );
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải thông báo");
      } else {
        setError({ hasError: true, message: "Lỗi kết nối API" });
      }
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  ///////////////////////////
  // Đánh dấu thông báo đã đọc
  ///////////////////////////
  const markAsRead = async (id) => {
    if (!authToken) return;

    try {
      await apis.apiUpdateNotificationReadStatus(id);
      socket.emit("mark-notification-read", id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      toast.error(error?.msg || "Không thể đánh dấu đã đọc");
    }
  };

  ///////////////////////////
  // Đánh dấu tất cả thông báo đã đọc
  ///////////////////////////
  const markAllAsRead = async () => {
    if (!authToken) return;

    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unreadNotifications.map((notification) =>
          apis.apiUpdateNotificationReadStatus(notification.id)
        )
      );
      socket.emit("mark-all-notifications-read");
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      toast.error(error?.msg || "Không thể đánh dấu tất cả đã đọc");
    }
  };

  ///////////////////////////////////////////
  // useEffect chính: chạy khi login/logout/F5
  ///////////////////////////////////////////
  useEffect(() => {
    if (!authToken) {
      // Nếu chưa login thì reset state
      setUserInfor(null);
      setNotifications([]);
      setIsLoadingUser(false);
      setIsLoadingNotifications(false);
      return;
    }

    // Nếu có token thì fetch data
    fetchUser();
    fetchNotifications();
    socket.emit("join-role", "admin");

    // Socket listeners
    socket.on("connect", () => {
      console.log("Kết nối socket:", socket.id);
      socket.emit("join-role", "admin");
    });

    socket.on("notification", (notification) => {
      const newNotification = {
        id: notification._id,
        type: notification.type,
        title: notification.type === "order" ? "Đơn hàng mới" : "Thông báo",
        message: notification.message,
        count: 1,
        time: "Vừa xong",
        isRead: notification.isRead,
        event: notification.event,
      };
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification._id)) return prev;
        return [newNotification, ...prev];
      });
    });

    socket.on("notification-read", (id) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    });

    socket.on("all-notifications-read", () => {
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    });

    socket.on("connect_error", (error) => {
      console.error("Lỗi kết nối socket:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket ngắt kết nối:", reason);
    });

    return () => {
      socket.off("notification");
      socket.off("notification-read");
      socket.off("all-notifications-read");
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, [authToken]); // ✅ chỉ chạy khi login/logout/F5

  return (
    <AdminTechZoneContext.Provider
      value={{
        authToken,
        setAuthToken, // 👈 dùng cho login/logout
        userInfor,
        setUserInfor,
        isLoadingUser,
        error,
        fetchUser,
        notifications,
        isLoadingNotifications,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        navigate,
        setError,
      }}
    >
      {children}
    </AdminTechZoneContext.Provider>
  );
};
